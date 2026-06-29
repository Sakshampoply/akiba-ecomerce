# API Reference

All API routes live under `src/app/api/`. Auth-protected routes check the session using `auth()` from `src/lib/auth.ts`. Admin routes additionally verify `session.user.role === "ADMIN"`.

---

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a new CUSTOMER account |
| `POST` | `/api/auth/[...nextauth]` | — | NextAuth handler (login, session, signout) |

### `POST /api/auth/register`

**Request:**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret123" }
```

**Response 201:**
```json
{ "message": "Account created" }
```

**Response 400:** `{ "error": "Email already in use" }`

---

## Products

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products with filters |
| `POST` | `/api/products` | Admin | Create a new product |
| `GET` | `/api/products/[id]` | Public | Get product by ID |
| `PATCH` | `/api/products/[id]` | Admin | Update product fields |
| `DELETE` | `/api/products/[id]` | Admin | Soft-delete product (sets `isActive: false`) |

### `GET /api/products` — Query params

| Param | Type | Description |
|---|---|---|
| `q` | string | Search in product name and description (ILIKE) |
| `category` | string | Filter by category slug |
| `sort` | `newest` \| `price_asc` \| `price_desc` | Sort order |
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 12) |
| `active` | boolean | Filter by `isActive` (default true) |

### `POST /api/products` — Request body

```json
{
  "name": "Tanjiro Figure",
  "slug": "tanjiro-kamado-1-7-scale",
  "description": "...",
  "brand": "Good Smile Company",
  "isPreOrder": false,
  "categories": ["clmdemo1"],
  "variants": [
    { "sku": "TAN-17-STD", "price": 8999, "stock": 50, "size": "1/7 Scale", "isDefault": true }
  ],
  "images": [
    { "url": "https://blob.vercel-storage.com/...", "altText": "Front view", "position": 0 }
  ]
}
```

---

## Product Images

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/products/[id]/images` | Admin | Add a `ProductImage` record |
| `DELETE` | `/api/products/[id]/images/[imageId]` | Admin | Remove image from Blob + DB |

---

## Categories

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List all categories |
| `POST` | `/api/categories` | Admin | Create a category |

---

## Checkout

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/checkout/intent` | Public | Create Stripe PaymentIntent, return `clientSecret` |

### `POST /api/checkout/intent` — Request body

```json
{
  "items": [
    { "variantId": "clm...", "quantity": 2 }
  ],
  "couponCode": "AKIBA10"
}
```

**Response 200:**
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "totalCents": 19438,
  "subtotalCents": 17998,
  "shippingCents": 799,
  "taxCents": 1440,
  "discountCents": 1799,
  "couponApplied": "AKIBA10"
}
```

---

## Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders/confirm` | Public | Create order after Stripe payment succeeds |
| `GET` | `/api/orders` | Admin | List all orders with filters |
| `PATCH` | `/api/orders/[id]` | Admin | Update order status or notes |
| `GET` | `/api/orders/my` | User | Get current user's orders |

### `POST /api/orders/confirm` — Request body

```json
{
  "paymentIntentId": "pi_xxx",
  "shippingAddress": {
    "name": "Alice Smith",
    "line1": "123 Main St",
    "city": "Tokyo",
    "state": "CA",
    "zip": "90210",
    "country": "US"
  },
  "couponCode": "AKIBA10"
}
```

**Response 200:**
```json
{
  "orderNumber": "AKB-00042",
  "totalCents": 19438,
  "status": "PAID"
}
```

---

## Coupons

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/coupons` | Admin | List all coupons |
| `POST` | `/api/coupons` | Admin | Create a coupon |
| `PATCH` | `/api/coupons/[id]` | Admin | Update (toggle `isActive`, etc.) |
| `DELETE` | `/api/coupons/[id]` | Admin | Delete coupon |
| `POST` | `/api/coupons/validate` | Public | Validate a coupon code against a subtotal |

### `POST /api/coupons/validate` — Request body

```json
{ "code": "AKIBA10", "subtotalCents": 8999 }
```

**Response 200:**
```json
{
  "valid": true,
  "type": "PERCENTAGE",
  "value": 10,
  "discountCents": 899,
  "message": "10% off applied"
}
```

---

## Inventory

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/inventory` | Admin | List variants with stock counts |
| `PATCH` | `/api/inventory/[variantId]` | Admin | Update stock count |

---

## Addresses

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/addresses` | User | Get current user's saved addresses |
| `POST` | `/api/addresses` | User | Add a saved address |
| `PATCH` | `/api/addresses/[id]` | User | Update address or set as default |
| `DELETE` | `/api/addresses/[id]` | User | Delete a saved address |

---

## File Upload

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | Admin | Upload file to Vercel Blob, return CDN URL |

**Request:** `multipart/form-data` with field `file` (any image type).

**Response 200:**
```json
{ "url": "https://xxxx.public.blob.vercel-storage.com/products/..." }
```

---

## Webhooks

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/webhooks/stripe` | Stripe signature | Handle `payment_intent.succeeded` — create order |

The endpoint validates the Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`. If validation fails, it returns `400`. See [Checkout Flow](./checkout.md) for the full order creation logic.

---

## Analytics (Admin)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/analytics` | Admin | Revenue, order count, top products, new customers |

The admin dashboard at `/admin` calls this endpoint. It runs Prisma aggregations over the `Order` and `OrderItem` tables.
