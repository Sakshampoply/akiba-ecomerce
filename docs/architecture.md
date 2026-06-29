# Architecture

## Overview

Akiba Shop uses a **feature-based folder structure** within Next.js App Router. The design mirrors the cartridge/module pattern used by Salesforce Commerce Cloud (SFCC), where each domain (catalog, cart, auth) owns its own code. This keeps bounded contexts explicit and avoids the "giant components" folder that grows unmanageable in large commerce projects.

---

## Folder Layout

```
src/
├── app/                        # Next.js routing layer
│   ├── (auth)/                 # Route group: login, register
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (storefront)/           # Route group: customer-facing pages
│   │   ├── layout.tsx
│   │   ├── products/
│   │   │   ├── page.tsx        # Catalog
│   │   │   └── [slug]/page.tsx # Product detail
│   │   ├── cart/page.tsx
│   │   ├── checkout/
│   │   │   ├── shipping/page.tsx
│   │   │   ├── payment/page.tsx
│   │   │   └── confirmation/page.tsx
│   │   └── search/page.tsx
│   ├── account/                # Protected user account pages
│   │   ├── page.tsx
│   │   ├── orders/page.tsx
│   │   └── addresses/
│   ├── admin/                  # Protected admin dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Analytics
│   │   ├── products/
│   │   ├── orders/
│   │   ├── inventory/
│   │   ├── promotions/
│   │   └── analytics/
│   └── api/                    # API route handlers
│       ├── auth/
│       ├── checkout/
│       ├── products/
│       ├── orders/
│       ├── coupons/
│       ├── inventory/
│       ├── addresses/
│       ├── categories/
│       ├── upload/
│       └── webhooks/stripe/
│
├── components/                 # Shared, non-feature-specific components
│   ├── layout/                 # Header, Footer, CartBadge, SearchBar
│   ├── catalog/                # ProductCard, SortSelect
│   ├── admin/                  # ImageUploader
│   └── ui/                     # Primitive UI: Button, Input, Badge, Toaster
│
├── features/                   # Feature modules (domain logic + state)
│   ├── cart/
│   │   ├── components/         # AddToCartButton, QuantitySelector
│   │   └── store/              # Zustand cart.store.ts
│   └── catalog/
│       └── repositories/       # product.repository.ts (data access)
│
├── lib/                        # App-wide singletons and utilities
│   ├── auth.ts                 # NextAuth full config (Node.js runtime)
│   ├── auth.config.ts          # NextAuth edge-safe config (no Prisma/bcrypt)
│   ├── prisma.ts               # Prisma singleton client
│   ├── stripe.ts               # Stripe singleton client
│   └── utils.ts                # formatPrice, slugify, generateOrderNumber, cn
│
├── middleware.ts               # Edge route protection
└── types/
    └── next-auth.d.ts          # Session/JWT type augmentation
```

---

## Route Groups

Next.js route groups (`(name)`) scope layouts without affecting the URL. Akiba uses three:

| Group | URL prefix | Layout purpose |
|---|---|---|
| `(storefront)` | `/products`, `/cart`, `/checkout`, `/search` | Adds Header + Footer |
| `(auth)` | `/login`, `/register` | Minimal auth layout |
| _(none)_ | `/admin`, `/account` | Admin sidebar / account nav |

This prevents the storefront header from appearing on admin or login pages without any conditional rendering logic.

---

## Repository Pattern

Database access follows a three-layer pattern:

```
API Route Handler
      ↓
  Business logic (validation, price calculation, auth check)
      ↓
  Repository / Prisma query
      ↓
  Neon PostgreSQL
```

The `src/features/catalog/repositories/product.repository.ts` file is the canonical example — it centralises all product queries (`getProducts`, `getProductBySlug`, `getCategories`) so the catalog page, search page, and product detail page all use the same query logic. API routes handle mutations directly via Prisma (no separate mutation repository layer currently).

---

## Component Colocation

Client components that are only used by a single server page live next to that page, not in the shared `components/` folder:

```
app/admin/orders/
├── page.tsx              ← RSC, fetches orders
└── OrderStatusSelect.tsx ← "use client", dropdown to update status

app/admin/promotions/
├── page.tsx
└── CouponActions.tsx     ← "use client", toggle/delete per coupon

app/account/addresses/
├── page.tsx
├── AddAddressForm.tsx    ← "use client"
└── AddressActions.tsx    ← "use client"
```

Shared client components (used across multiple pages) live in `src/components/`.

---

## Key Design Decisions

### Prices stored as integers (cents)

All prices in the database are `Int` (cents, not dollars). `$29.99` is stored as `2999`.

**Why:** Floating-point arithmetic is unreliable for currency. `0.1 + 0.2 === 0.30000000000000004` in JavaScript. Integer cents arithmetic is exact. Conversion to display format happens only at the UI layer via `formatPrice(cents)` in `src/lib/utils.ts`.

### Singleton Prisma client

`src/lib/prisma.ts` uses the `globalThis` pattern:

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

**Why:** Next.js hot-reload in development creates a new module instance on every file change. Without this pattern, each reload opens a new Prisma connection, exhausting the PostgreSQL connection pool within minutes.

### OrderItem denormalisation

`OrderItem` records snapshot `productName`, `variantLabel`, and `imageUrl` at the moment of purchase — they are not foreign keys to the live product data.

**Why:** Products get renamed, repriced, and deleted. Order history must always show what the customer actually bought and paid, not the current state of the product. This is the standard commerce pattern (used by SFCC, Shopify, etc.).

### generateOrderNumber()

Orders get a human-readable `AKB-XXXXX` number (e.g. `AKB-00042`) generated in `src/lib/utils.ts` from the Prisma `cuid`. This is separate from the DB `id` — the order ID is internal, the order number is customer-facing.

---

## Technology Rationale

| Decision | Chosen | Alternatives considered | Reason |
|---|---|---|---|
| Database | Neon (serverless Postgres) | PlanetScale, Supabase | Serverless auto-pause, standard Postgres, Prisma support |
| Auth | NextAuth v5 | Clerk, Auth0, custom JWT | Zero vendor lock-in, full control, free |
| Cart state | Zustand | Redux, Context, server cart | Minimal boilerplate, persist middleware built-in, no re-render cascade |
| Payments | Stripe | PayPal, Paddle | Industry standard, best DX, test mode |
| File storage | Vercel Blob | AWS S3, Cloudinary | Zero config on Vercel, CDN included |
| Styling | Tailwind CSS 4 | CSS Modules, styled-components | Utility-first, no runtime overhead, Radix UI compatible |
