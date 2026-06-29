# Performance

## Strategy Summary

Akiba Shop prioritises **zero-database-hit on cache hit** for all customer-facing pages, while keeping admin always fresh. Every latency optimisation falls into one of four categories:

1. **Render fewer server round-trips** — ISR, static params
2. **Ship less JavaScript to the browser** — RSC by default, tree-shaking
3. **Avoid connection overhead** — pgbouncer pooler, singleton Prisma
4. **Optimise assets** — `next/image`, Vercel Blob CDN

---

## ISR on Catalog and Product Pages

```ts
// app/(storefront)/products/page.tsx
export const revalidate = 60

// app/(storefront)/products/[slug]/page.tsx
export const revalidate = 60
```

A cached catalog page is served as static HTML from Vercel's Edge Network. The database is hit at most once per minute, regardless of traffic volume. For a product catalog that changes a few times a day, this means:

- 99%+ of requests: zero DB queries, sub-10ms TTFB
- At most 1 DB query per 60 seconds per route to check for staleness

Product updates (price changes, new images, stock updates) appear on the storefront within 60 seconds automatically.

---

## `generateStaticParams` — Pre-built Product Pages

```ts
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
    take: 100,
  })
  return products.map((p) => ({ slug: p.slug }))
}
```

At deploy time, Next.js pre-renders the first 100 product pages. These pages exist as static HTML before any user ever requests them. There is zero DB query for any of these pages on cache hit — they are pure CDN delivery.

Products beyond the first 100 are rendered on demand on first request and then cached via ISR.

---

## `force-dynamic` Scoped to Admin Only

```ts
// All admin pages
export const dynamic = "force-dynamic"
```

Caching is disabled **only** for admin routes. The storefront always benefits from ISR. Because admins are a small, authenticated user group, the cost of bypassing the cache is acceptable — they need real-time order counts, current inventory, and live analytics.

---

## `optimizePackageImports` — Icon Tree-Shaking

`next.config.ts`:

```ts
experimental: {
  optimizePackageImports: ["lucide-react", "framer-motion"],
}
```

Without this, importing any icon from `lucide-react` would bundle the entire icon library into the JavaScript sent to the browser. With this flag, Next.js only bundles the specific icons imported. `lucide-react` has ~1,400 icons — tree-shaking reduces this to the ~30 used in the app.

---

## Singleton Prisma Client

`src/lib/prisma.ts`:

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

In Next.js development mode, hot-reload creates new module instances on every code change. Without the `globalThis` singleton, each hot-reload would open a new Prisma connection to Neon. With 10-20 reloads per development session, this would exhaust the free-tier connection limit within minutes.

In production (Vercel serverless), each function invocation is isolated — the singleton has less effect there, but it avoids creating multiple connections within a single invocation if the module is imported multiple times.

---

## pgbouncer Connection Pooling

The `DATABASE_URL` points to Neon's **pgbouncer pooler**, not the direct Postgres endpoint:

```
DATABASE_URL=postgresql://...@ep-xxx.pooler.neon.tech/neondb?sslmode=require
```

**Why this matters for serverless:** Each Vercel serverless function invocation can open a new connection to the database. Under load, hundreds of simultaneous invocations would each open a connection, quickly exhausting PostgreSQL's ~100 connection limit. pgbouncer multiplexes all these connections through a small pool — externally appearing as many connections, internally using only a few.

The `DIRECT_URL` bypasses pgbouncer and connects directly to Postgres. It's only used for `prisma migrate deploy` because Prisma's migration advisory locks require a persistent connection that pgbouncer's transaction-mode pooling doesn't support.

---

## `next/image` — Automatic Image Optimisation

Every product image uses `next/image`:

```tsx
<Image
  src={image.url}
  alt={image.altText ?? product.name}
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
/>
```

This provides:
- **Format conversion:** Serves WebP (or AVIF) instead of original JPEG/PNG — typically 30-50% smaller
- **Responsive srcset:** Different image sizes for different viewport widths (defined by `sizes`)
- **Lazy loading:** Images below the fold are not fetched until the user scrolls near them (`loading="lazy"` is the default)
- **CDN caching:** Optimised images are cached at the edge, not re-processed on every request

---

## Lazy Expand SearchBar

The `SearchBar` component in the header is collapsed by default:

```tsx
{isOpen ? (
  <input autoFocus ... />
) : (
  <button onClick={() => setIsOpen(true)}>
    <Search className="w-4 h-4" />
  </button>
)}
```

The `<input>` element is only mounted in the DOM when the user clicks the search icon. This keeps the initial page HTML smaller and avoids rendering an unfocused input on every page load.

---

## Prices in Cents — No Float Arithmetic

All price calculations use integer arithmetic:

```ts
// Correct:
const tax = Math.round(subtotal * 0.08)  // subtotal is an integer (cents)
const total = subtotal - discount + shipping + tax  // all integers

// What we avoid:
const total = (subtotalDollars - discountDollars + shippingDollars) * 1.08
// → floating-point errors, e.g. $17.999999999999996
```

Integer arithmetic eliminates rounding errors in tax calculations and coupon applications. `Math.round()` is used only once per tax/percentage calculation.

---

## sessionStorage for Checkout — No Extra Round-Trip

The shipping address is stored in `sessionStorage` at the end of step 2 and read back in step 4 without a DB query. This avoids:

- A DB write on every shipping form submission
- A DB read on the payment confirmation page

The shipping address reaches the DB only once — when the order is created.
