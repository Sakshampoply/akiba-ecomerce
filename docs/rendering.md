# Rendering Strategy

## Overview

Next.js App Router makes every file a **React Server Component (RSC)** by default. The `"use client"` directive opts a component into the client bundle. Akiba Shop uses the following rule of thumb:

> **Default to RSC. Add `"use client"` only when you need browser APIs, event handlers, or client state.**

---

## Rendering Mode Per Page

| Route | Mode | Rendering | Reason |
|---|---|---|---|
| `/` (homepage) | RSC | ISR (60s) | Static hero, featured products — cache-friendly |
| `/products` | RSC | ISR (60s) | Catalog changes rarely; cache serves most traffic |
| `/products/[slug]` | RSC | ISR (60s) + Static | Top 100 slugs pre-built at deploy |
| `/search` | RSC | Dynamic | Query param prevents caching |
| `/cart` | Client | — | Reads Zustand/localStorage — must be client |
| `/checkout/shipping` | Client | — | Form state, sessionStorage |
| `/checkout/payment` | Client | — | Stripe Elements require browser SDK |
| `/checkout/confirmation` | Client + Suspense | — | Fetches PaymentIntent after redirect |
| `/account` | RSC | Dynamic | Protected, user-specific data |
| `/account/orders` | RSC | Dynamic | Protected, user-specific data |
| `/account/addresses` | RSC | Dynamic | Protected, user-specific data |
| `/admin/*` | RSC | `force-dynamic` | Real-time data, no stale cache acceptable |
| `/login`, `/register` | Client | Static | Form interaction only |

---

## Incremental Static Regeneration (ISR)

Catalog and product detail pages export:

```ts
export const revalidate = 60 // seconds
```

This tells Next.js to serve a cached static page for up to 60 seconds. After 60 seconds, the next request triggers a background regeneration — the old page is served until the new one is ready. This means:

- The database is hit at most once per minute per page, regardless of traffic
- First-byte time is effectively zero for cached pages (served from Vercel Edge Network)
- Product updates appear within ~60 seconds without a full redeploy

---

## Static Generation with `generateStaticParams`

The product detail page at `/products/[slug]` uses:

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

At build time, Next.js pre-renders the first 100 active product pages as static HTML. Requests for these pages hit zero database — the page is already on the CDN edge. Slugs beyond the first 100 fall back to on-demand rendering and are then cached by ISR.

---

## `force-dynamic` on Admin Pages

Every admin page exports:

```ts
export const dynamic = "force-dynamic"
```

This disables all caching for admin routes. Admin data (orders, inventory, analytics) must always be fresh — a 60-second stale dashboard during a flash sale would be a problem. Because admins are a small, known user group, the cost of skipping the cache is low.

---

## Client Components

A component requires `"use client"` when it uses any of:

- `useState`, `useEffect`, `useRef`, or other React hooks
- Browser APIs (`window`, `localStorage`, `sessionStorage`)
- Event handlers (`onClick`, `onChange`)
- Third-party browser-only SDKs (Stripe Elements, toast libraries)
- Zustand store access (the store itself is shared, but the hook that reads it requires a client render)

### Key client components in Akiba Shop

| Component | Why client |
|---|---|
| `SearchBar` | `useState` for expand/collapse, keyboard handler |
| `SortSelect` | `useRouter` + `useSearchParams` to update URL params |
| `AddToCartButton` | `useCartStore`, `useState` for "Added!" animation |
| `CartBadge` | `useCartStore` to read item count |
| `cart/page.tsx` | Full page reads Zustand cart — must be client |
| `checkout/shipping/page.tsx` | Form state + sessionStorage |
| `checkout/payment/page.tsx` | Stripe `Elements` + `useStripe` hooks |
| `checkout/confirmation/page.tsx` | `useSearchParams`, fetch after mount |
| `OrderStatusSelect` | `onChange` API call, `useState` for optimistic UI |
| `CouponActions` | Toggle/delete with optimistic feedback |
| `AddAddressForm` | Form + `useState` |
| `ImageUploader` | File input, preview state, upload fetch |

---

## Colocation Pattern

Client components used by only one server page live next to that page, not in the shared `components/` folder:

```
app/admin/orders/
├── page.tsx              ← RSC — fetches + renders order list
└── OrderStatusSelect.tsx ← "use client" — dropdown to update status inline

app/admin/promotions/
├── page.tsx
└── CouponActions.tsx     ← "use client" — toggle isActive, delete coupon
```

This makes it obvious at a glance which components are purpose-built vs reusable.

---

## Suspense

The checkout confirmation page wraps its data fetching in `<Suspense>` because it needs to:

1. Read the `payment_intent` search param from the URL (set by Stripe after redirect)
2. Fetch the PaymentIntent from Stripe to confirm status
3. Fetch the order from the DB

```tsx
<Suspense fallback={<ConfirmationSkeleton />}>
  <OrderConfirmation paymentIntentId={piId} />
</Suspense>
```

This prevents the page from blocking on the server while showing a loading state to the user immediately.
