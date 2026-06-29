# Database

## Overview

Akiba Shop uses **PostgreSQL** (hosted on [Neon](https://neon.tech)) accessed via **Prisma ORM**. The schema covers six domains: auth, catalog, cart, orders, addresses, and promotions.

**Two connection URLs are required:**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon pgbouncer pooler — used for all runtime queries. Multiplexes connections across serverless invocations. |
| `DIRECT_URL` | Direct Neon connection — used only by `prisma migrate deploy`. Required because pgbouncer does not support the advisory locks that Prisma needs for migrations. |

---

## Entity Relationship Overview

```
User ──────┬── Order ──── OrderItem ──── Product ──── ProductVariant
           │                │                │
           ├── Address       └── ShippingAddress  └── ProductImage
           └── Cart ──── CartItem              │
                                          ProductCategory ── Category

Coupon ─── Order
       └── Cart
```

---

## Enums

### `Role`
```
CUSTOMER   (default)
ADMIN
```

### `OrderStatus`
```
PENDING             → payment not yet initiated
PAYMENT_PROCESSING  → Stripe is processing
PAID                → payment confirmed, not yet fulfilled
PROCESSING          → warehouse picking/packing
SHIPPED             → tracking number issued
DELIVERED           → confirmed received
CANCELLED           → cancelled before fulfillment
REFUNDED            → money returned
```

### `DiscountType`
```
PERCENTAGE     → value is 0–100 (percent)
FIXED_AMOUNT   → value is in cents
FREE_SHIPPING  → value ignored, shipping set to $0
```

---

## Models

### `User`

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `email` | String | Unique, indexed |
| `emailVerified` | DateTime? | Set by OAuth providers |
| `name` | String? | Display name |
| `passwordHash` | String? | bcrypt hash — null for OAuth users |
| `role` | Role | `CUSTOMER` or `ADMIN` |
| `createdAt` | DateTime | Auto-set |
| `updatedAt` | DateTime | Auto-updated |

Relations: `accounts`, `sessions`, `cart`, `orders`, `addresses`

---

### `Account` / `Session` / `VerificationToken`

Standard NextAuth adapter tables. Managed automatically by `@auth/prisma-adapter`. Do not write to these directly.

---

### `Category`

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | Display name (e.g. "Figures") |
| `slug` | String | Unique URL segment (e.g. "figures") |
| `description` | String? | |
| `imageUrl` | String? | Category hero image |
| `parentId` | String? | Self-referential for nested categories |

Supports hierarchical categories via self-join (`parent` / `children`).

---

### `Product`

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | |
| `slug` | String | Unique, indexed — used in URLs |
| `description` | String (Text) | Long-form |
| `brand` | String? | e.g. "Good Smile Company" |
| `isActive` | Boolean | `false` = soft-deleted, hidden from storefront |
| `isPreOrder` | Boolean | Skips stock check, stock not decremented on order |
| `preOrderDate` | DateTime? | Expected availability date |
| `createdAt` / `updatedAt` | DateTime | |

Indexes: `slug`, `isActive`

Relations: `categories` (via `ProductCategory`), `variants`, `images`, `orderItems`, `cartItems`

---

### `ProductVariant`

One product has one or more variants (sizes, editions). Each has its own price and stock.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `productId` | String | FK → Product |
| `sku` | String | Unique across all variants |
| `price` | Int | **Cents** (e.g. 8999 = $89.99) |
| `compareAt` | Int? | Original price in cents (for "Sale" badge) |
| `stock` | Int | Current inventory count |
| `size` | String? | e.g. "L", "1/7 Scale" |
| `color` | String? | Reserved for future use |
| `weight` | Float? | Reserved for shipping calc |
| `isDefault` | Boolean | Which variant loads on the product page |

Indexes: `productId`, `sku`

---

### `ProductImage`

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `productId` | String | FK → Product |
| `url` | String | Vercel Blob CDN URL or external URL |
| `altText` | String? | Screen reader / SEO text |
| `position` | Int | Display order (ascending) |

Images are ordered by `position asc` in all queries. The first image (`position = 0`) is used as the product card thumbnail.

---

### `ProductCategory`

Join table for the many-to-many relationship between products and categories.

| Field | Type |
|---|---|
| `productId` | String (composite PK) |
| `categoryId` | String (composite PK) |

---

### `Cart`

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `userId` | String? | Unique — one cart per user |
| `guestId` | String? | For anonymous carts (not yet implemented) |
| `couponId` | String? | Applied coupon |

> **Note:** The DB Cart model exists for future server-side cart sync. The active cart is currently stored client-side in Zustand/localStorage. See [State Management](./state-management.md).

---

### `CartItem`

| Field | Type |
|---|---|
| `id` | String (cuid) |
| `cartId` | String |
| `productId` | String |
| `variantId` | String |
| `quantity` | Int |

Unique constraint on `(cartId, variantId)` — prevents duplicate variant rows.

---

### `Order`

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Internal ID |
| `orderNumber` | String | Unique, human-readable `AKB-XXXXX` |
| `userId` | String? | Null for guest orders |
| `guestEmail` | String? | For guest order lookups |
| `status` | OrderStatus | See enum above |
| `subtotalCents` | Int | Sum of items before discounts |
| `shippingCents` | Int | 0 or 799 ($7.99) |
| `discountCents` | Int | Coupon savings |
| `taxCents` | Int | 8% of subtotal |
| `totalCents` | Int | Final charged amount |
| `currency` | String | Always `"usd"` |
| `stripePaymentId` | String? | Unique — used for idempotency |
| `couponId` | String? | Applied coupon FK |
| `notes` | String? | Internal admin notes |

Indexes: `userId`, `status`, `createdAt`

---

### `OrderItem`

Denormalised snapshot of what was purchased. **Never references live product data for display** — uses the snapshot fields instead.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `orderId` | String | FK → Order |
| `productId` | String | FK → Product (for analytics joins) |
| `variantId` | String | FK → ProductVariant (for analytics) |
| `productName` | String | **Snapshot at purchase time** |
| `variantLabel` | String | **Snapshot at purchase time** |
| `imageUrl` | String? | **Snapshot at purchase time** |
| `quantity` | Int | |
| `unitPriceCents` | Int | Price paid per unit |
| `totalCents` | Int | `unitPriceCents × quantity` |

---

### `ShippingAddress`

One-to-one with Order. Captured at checkout.

| Field | Type |
|---|---|
| `id` | String (cuid) |
| `orderId` | String (unique) |
| `name` | String |
| `line1`, `line2` | String / String? |
| `city`, `state`, `zip` | String |
| `country` | String (default `"US"`) |
| `phone` | String? |

---

### `Address`

User's saved addresses (account page).

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `userId` | String | FK → User |
| `label` | String? | "Home", "Work", "Other" |
| `isDefault` | Boolean | Only one per user can be true |
| `name`, `line1`, `line2` | String / String? | |
| `city`, `state`, `zip`, `country` | String | |
| `phone` | String? | |

When setting a new default, the API first clears all other `isDefault` flags for the user.

---

### `Refund`

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `orderId` | String | FK → Order |
| `stripeRefundId` | String | Unique — Stripe's refund ID |
| `amountCents` | Int | |
| `reason` | String? | |

Refund processing is not yet wired to the admin UI — the model is in place for future implementation.

---

### `Coupon`

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `code` | String | Unique, uppercase |
| `type` | DiscountType | See enum |
| `value` | Int | Cents for FIXED_AMOUNT, percent for PERCENTAGE |
| `minOrderCents` | Int? | Minimum subtotal to apply |
| `maxUsage` | Int? | Usage cap (null = unlimited) |
| `usageCount` | Int | Incremented on each order |
| `isActive` | Boolean | Admin can toggle |
| `expiresAt` | DateTime? | |

Index: `code`

---

## Migrations

One migration exists: `20260629104855_init` — creates all tables from scratch.

Run migrations:
```bash
npx prisma migrate deploy   # production (uses DIRECT_URL)
npx prisma migrate dev      # development (creates new migration if schema changed)
```

Seed demo data:
```bash
npm run seed
```
