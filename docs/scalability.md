# Scalability

## Current Architecture

Akiba Shop is built to production-grade standards and runs on serverless infrastructure (Vercel + Neon), which auto-scales horizontally with no manual intervention. Most commerce platforms at startup to mid-scale operate comfortably within this model.

This document maps the evolutionary path from current implementation to high-scale architecture, identifying the bottlenecks that would appear first and the architectural changes that address them.

---

## Async Workers & Background Jobs

### The problem

Order confirmation currently runs synchronously in a single HTTP request:

```
POST /api/orders/confirm
  → verify Stripe payment          (~100ms)
  → create Order in DB             (~50ms)
  → create OrderItems              (~30ms)
  → decrement stock × N items      (~50ms)
  → increment coupon usageCount    (~20ms)
  → return response                → total: ~250ms
```

At scale (flash sale, bot traffic), this creates lock contention on `ProductVariant.stock` rows and makes the checkout feel slow.

### The solution: queue-based order processing

```
POST /api/orders/confirm
  → verify Stripe payment          (~100ms)
  → enqueue OrderJob { paymentIntentId }  (~5ms)
  → return 202 Accepted            → total: ~110ms

Background worker (BullMQ + Redis or Inngest):
  → process OrderJob
  → create Order, OrderItems, ShippingAddress
  → decrement stock
  → send order confirmation email
  → trigger warehouse webhook
```

**Suitable tools:**

| Tool | Best for |
|---|---|
| [Inngest](https://inngest.com) | Vercel-native, no Redis required, retry/replay built-in |
| BullMQ + Redis | Self-hosted, more control, local dev with Redis |
| Vercel Cron | Scheduled (not event-driven) jobs — analytics rollups |

The Stripe webhook handler (`/api/webhooks/stripe`) is already an async entry point — it's the natural place to enqueue rather than process inline.

### Email notifications (not yet implemented)

Order confirmation emails, shipping update emails, and restock alerts are natural async jobs. The current architecture has no email sending — this would be the first async worker to add.

**Integration path:**
1. Add Resend or SendGrid API key to env
2. In the webhook handler, after order creation, enqueue `SendOrderConfirmationEmail { orderId }`
3. Worker fetches order + items, renders email template, sends via Resend

---

## Database Scaling

### Connection pooling (already in place)

Neon pgbouncer multiplexes Vercel serverless connections. This handles most scaling needs without any code changes — the pooler appears as a single connection pool to Postgres regardless of how many serverless invocations are running.

### Read replicas for catalog queries

Product catalog queries (`getProducts`, `getProductBySlug`) are read-heavy and can tolerate slight replication lag. At high read volume:

1. Create a Neon read replica
2. Create a `prismaRead` client pointing to the replica URL
3. Use `prismaRead` in `product.repository.ts` for all read queries
4. Continue using `prisma` (write primary) for orders, cart mutations, admin writes

### Indexes (already in place)

Key indexes on the current schema:
- `User.email` — login, registration uniqueness
- `Product.slug` — product detail page lookup
- `Product.isActive` — catalog filtering
- `ProductVariant.sku` — inventory management, import/export
- `Order.userId`, `Order.status`, `Order.createdAt` — order history, admin dashboard grouping
- `Coupon.code` — coupon validation at checkout

### Future index for search

The current `getProducts` search uses Prisma `contains` → PostgreSQL `ILIKE '%query%'`. This performs a full table scan and doesn't support ranking. At scale, add:

```sql
-- PostgreSQL full-text index
CREATE INDEX product_fts ON "Product" USING gin(to_tsvector('english', name || ' ' || description));
```

Or replace with Algolia for fuzzy matching, typo tolerance, and faceted filtering.

---

## Search

### Current implementation

```ts
where: {
  OR: [
    { name: { contains: q, mode: "insensitive" } },
    { description: { contains: q, mode: "insensitive" } },
  ]
}
```

PostgreSQL `ILIKE` is sequential scan on unindexed text — acceptable for thousands of products, slow for hundreds of thousands.

### Migration path

1. **Short-term:** Add `pg_trgm` extension and a trigram GIN index. Improves `ILIKE` performance without changing application code.
2. **Medium-term:** Add Algolia or Typesense. Sync products via webhook on create/update/delete. Replace the search page's Prisma query with an Algolia client call. Gains: typo tolerance, facets, ranking by sales, instant search.

---

## Cart Sync (Server-Side)

### Current: localStorage only

The Zustand cart persists to `localStorage`. This means:
- Cart is device-specific — lost when user switches devices
- No server-side visibility — can't detect abandoned carts
- No server-side coupon validation until checkout

### Migration path: merge cart on login

1. On successful login, read local Zustand cart
2. `POST /api/cart/sync` with all local items
3. Server merges with DB cart (take higher quantity for conflicts)
4. Return merged cart, update Zustand store

The DB `Cart` and `CartItem` models are already in place — only the sync API endpoint and client-side merge logic need to be written.

---

## Admin Analytics Scaling

### Current: raw aggregations on every page load

The admin dashboard runs Prisma `groupBy` and `aggregate` queries on every visit:

```ts
export const dynamic = "force-dynamic"

// On every /admin page load:
const revenue = await prisma.order.aggregate({ _sum: { totalCents: true } })
const topProducts = await prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true } })
```

At high order volumes, these become slow table scans.

### Migration path: precomputed rollups

1. Create a `DailyMetrics` table with precomputed daily revenue, order count, top products
2. Run a Vercel Cron job (`vercel.json` cron trigger) at midnight UTC to aggregate the previous day
3. Admin dashboard reads from `DailyMetrics` instead of live order data
4. Keep a "today" query for the current day's live data

---

## CDN & Static Assets

### What's already in place

- Vercel Edge Network serves ISR pages globally
- Vercel Blob CDN (Cloudflare-backed) serves product images globally
- `next/image` serves WebP with responsive srcset

### What scales automatically

Vercel deploys to ~30+ edge regions. Static and ISR pages are cached at the edge closest to the user. No configuration needed — this happens automatically.

### Multi-region database

Neon supports creating read replicas in multiple AWS regions. If most traffic comes from the US East and Japan, adding replicas in `ap-northeast-1` and `us-east-1` reduces latency for catalog reads to ~5ms instead of ~80ms cross-region.

---

## Middleware Edge Runtime

The auth middleware runs at the Vercel edge (not in a Node.js function). It uses only `auth.config.ts` — no Prisma, no bcrypt, no Node.js APIs. This means route protection runs at the CDN layer, geographically close to the user, adding ~1ms overhead rather than a full round-trip to a serverless function.

This is already in place and requires no changes to scale.
