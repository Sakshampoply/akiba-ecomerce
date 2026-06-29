# Checkout Flow

## Overview

Checkout is a four-step flow: **Cart → Shipping → Payment → Confirmation**. It uses Stripe's PaymentIntent API with a dual-path order creation strategy (direct confirm + webhook fallback) to ensure orders are never lost.

---

## Step-by-Step Flow

```
1. /cart               → Review items, apply coupon, click "Proceed to Checkout"
2. /checkout/shipping  → Enter shipping address → saved to sessionStorage → Next
3. /checkout/payment   → Stripe PaymentElement → confirm payment → redirect
4. /checkout/confirmation → Verify payment → show order number
```

---

## Step 1: Cart (`/cart`)

- Cart is read from Zustand (localStorage key `"akiba-cart"`)
- Coupon input is displayed but validation happens server-side during intent creation
- Shipping estimate: free if subtotal > $75 (7500 cents), else $7.99 (799 cents)
- Tax: 8% flat on subtotal
- Clicking "Proceed to Checkout" navigates to `/checkout/shipping`

---

## Step 2: Shipping (`/checkout/shipping`)

- Client page with a controlled form (name, address line 1/2, city, state, zip, country)
- On submit, the shipping address is written to `sessionStorage` as JSON:

```ts
sessionStorage.setItem("checkout_shipping", JSON.stringify(formData))
```

**Why sessionStorage, not Zustand?** Shipping data is only needed for the current checkout session. Persisting it to localStorage would leave stale address data after the user completes or abandons checkout. sessionStorage is cleared when the tab closes.

---

## Step 3: Payment (`/checkout/payment`)

### PaymentIntent creation

On page mount, the client calls:

```
POST /api/checkout/intent
Body: { items: CartItem[], couponCode?: string }
```

Server-side in `/api/checkout/intent/route.ts`:

1. Fetch all `ProductVariant` prices from the database (never trust client-sent prices)
2. Calculate subtotal in cents: `sum(variant.price × quantity)`
3. Validate coupon if provided (`isActive`, `expiresAt`, `minOrderCents`, `maxUsage`)
4. Apply coupon discount (PERCENTAGE, FIXED_AMOUNT, or FREE_SHIPPING)
5. Add shipping (799 or 0) and tax (8%)
6. Call `stripe.paymentIntents.create({ amount: totalCents, currency: "usd", metadata: { ... } })`
7. Return `{ clientSecret, orderId, totalCents, discountCents, ... }`

The server calculates the final price — the client only provides the product IDs and quantities.

### Stripe Elements

The client mounts Stripe's `PaymentElement` using the `clientSecret`:

```tsx
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentForm />
</Elements>
```

`PaymentElement` renders the card form (and other payment methods) natively in Stripe's hosted iframe — Akiba never touches raw card numbers.

### Payment confirmation

```ts
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: `${window.location.origin}/checkout/confirmation`,
  },
})
```

After successful payment, Stripe redirects to `/checkout/confirmation?payment_intent=pi_xxx&...`.

---

## Step 4: Confirmation (`/checkout/confirmation`)

The page reads the `payment_intent` query param and calls:

```
POST /api/orders/confirm
Body: { paymentIntentId: "pi_xxx", shippingAddress: { ... }, couponCode?: string }
```

This is the **direct confirm path** — used because Stripe webhooks can't reach localhost during development.

### Order creation in `/api/orders/confirm`

1. Call `stripe.paymentIntents.retrieve(paymentIntentId)`
2. Check `paymentIntent.status === "succeeded"`
3. **Idempotency check:** `prisma.order.findUnique({ where: { stripePaymentId: paymentIntentId } })`
   - If order already exists (created by webhook), return it — do not create a duplicate
4. Re-fetch variant prices and recalculate totals (never trust client)
5. Validate and apply coupon again
6. `prisma.$transaction([...])`
   - Create `Order` with all price fields
   - Create `OrderItem` records with **snapshots** of product name, variant label, image URL
   - Create `ShippingAddress` record
   - Decrement `ProductVariant.stock` for each item (skip if `isPreOrder`)
   - Increment `Coupon.usageCount` if coupon applied
7. Return `{ orderNumber, totalCents, ... }`

The confirmation page displays the order number (`AKB-XXXXX`) and a success message.

---

## Webhook Fallback (`/api/webhooks/stripe`)

Stripe also sends a `payment_intent.succeeded` event to the webhook endpoint. This is the **production-reliable path**.

```ts
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

if (event.type === "payment_intent.succeeded") {
  const pi = event.data.object
  // Same idempotency check + order creation logic as /api/orders/confirm
}
```

**Why two code paths?**

- Webhooks require a public URL (not `localhost`). During development, the direct confirm endpoint is the only option.
- In production, webhooks are the reliable fallback — if the customer closes the tab before the confirmation page calls `/api/orders/confirm`, the webhook still creates the order.
- Both paths check for an existing order first (idempotency), so the order is created exactly once even if both paths run.

---

## Idempotency

Both `/api/orders/confirm` and the Stripe webhook handler begin with:

```ts
const existing = await prisma.order.findUnique({
  where: { stripePaymentId: paymentIntentId }
})
if (existing) return existing // already processed
```

`stripePaymentId` has a `@unique` constraint in the schema, so even if both code paths execute simultaneously (race condition), the second `prisma.order.create` call will throw a unique constraint error rather than creating a duplicate.

---

## Coupon Logic

| Type | Calculation |
|---|---|
| `PERCENTAGE` | `discountCents = Math.round(subtotal × value / 100)` |
| `FIXED_AMOUNT` | `discountCents = Math.min(value, subtotal)` (can't go negative) |
| `FREE_SHIPPING` | `shippingCents = 0` |

Validation rules applied server-side:
- `coupon.isActive === true`
- `coupon.expiresAt` is null or in the future
- `subtotal >= coupon.minOrderCents` (if set)
- `coupon.usageCount < coupon.maxUsage` (if set)

---

## Price Calculation Summary

```
subtotal     = sum(variant.price × quantity)          [from DB, in cents]
discount     = coupon savings                          [cents]
shipping     = subtotal > 7500 ? 0 : 799              [cents]
tax          = round(subtotal × 0.08)                  [cents]
total        = subtotal - discount + shipping + tax    [cents]
```

All arithmetic is integer. Division only occurs in percentage discount calculation, always followed by `Math.round()`.
