# State Management

## Overview

Client-side state in Akiba Shop is minimal and intentional. The only piece of global client state is the **shopping cart**. Everything else is either:

- Server-fetched and rendered as RSC (product catalog, order history, admin data)
- Local component state with `useState` (form inputs, UI toggles)
- sessionStorage (checkout shipping address — one-shot data for the current checkout flow)

---

## Cart Store (Zustand)

**File:** `src/features/cart/store/cart.store.ts`

### Why Zustand?

| | Zustand | React Context | Redux |
|---|---|---|---|
| Boilerplate | Minimal | Low | High |
| Re-render control | Fine-grained (selector per component) | All consumers re-render | Fine-grained |
| Persistence | Built-in `persist` middleware | Manual | Requires middleware |
| DevTools | Supported | N/A | Built-in |
| Bundle size | ~1KB | 0 | ~16KB |

Context re-renders all consumers when any value changes. A cart with 10 items would re-render every component that reads the cart whenever any item quantity changes. Zustand's selector pattern (`useCartStore((s) => s.totalItems())`) means only the component subscribed to `totalItems` re-renders when the count changes.

---

## `CartItem` Interface

```ts
export interface CartItem {
  id: string          // same as variantId — used as the deduplication key
  productId: string
  variantId: string
  productName: string
  variantLabel: string
  price: number       // in cents — matches ProductVariant.price from DB
  compareAt?: number  // original price in cents (for sale badge)
  quantity: number
  emoji?: string      // fallback display when no image
  imageUrl?: string   // Vercel Blob CDN URL or external URL
}
```

**Why `variantId` as the key?** A product with sizes S, M, L can have all three variants in the cart simultaneously. Using `productId` as the key would merge them. Using `variantId` keeps them as separate line items with their own quantities.

**`imageUrl` vs `emoji`:** `imageUrl` is set when the product has a real uploaded image (Vercel Blob). `emoji` is the fallback character set in the product seeder. The cart and confirmation pages always prefer `imageUrl` if present, fall back to `emoji`, then fall back to a generic `📦`.

---

## Store Actions

```ts
addItem(item)
// If variantId already in cart → increment quantity
// Otherwise → append new CartItem with quantity = 1

removeItem(variantId)
// Filter out the item with the given variantId

updateQuantity(variantId, quantity)
// If quantity ≤ 0 → remove the item (same as removeItem)
// Otherwise → update the quantity

clearCart()
// Empty the items array — called after successful order creation

totalItems() → number
// Sum of all item quantities — used by CartBadge

subtotalCents() → number
// Sum of (item.price × item.quantity) — used by cart page and checkout intent
```

---

## Persistence

```ts
persist(
  (set, get) => ({ ... }),
  { name: "akiba-cart" }  // localStorage key
)
```

The `persist` middleware from Zustand automatically:

1. Hydrates the store from `localStorage["akiba-cart"]` on first render
2. Writes to `localStorage["akiba-cart"]` on every state change

This means a user's cart survives page refreshes, browser restarts, and navigating away — until they explicitly clear it (via `clearCart()` after order completion) or clear their browser storage.

**Hydration note:** There is a brief SSR/CSR mismatch window. The server renders with an empty cart (no localStorage access on server), then the client hydrates with the real cart. This causes a flash for the CartBadge count. Zustand v5 handles this with `useHydration` — the badge reads as 0 until hydration completes.

---

## Fine-Grained Subscriptions

Components subscribe to exactly the slice of state they need:

```tsx
// CartBadge — only re-renders when total item count changes
const count = useCartStore((s) => s.totalItems())

// Cart page — re-renders when items array changes
const items = useCartStore((s) => s.items)

// Checkout page — reads subtotal once
const subtotal = useCartStore((s) => s.subtotalCents())
```

A component that only reads `totalItems()` does not re-render when item prices change, when image URLs are updated, or when any other field changes.

---

## sessionStorage for Checkout

The shipping address entered in `/checkout/shipping` is saved to `sessionStorage`:

```ts
sessionStorage.setItem("checkout_shipping", JSON.stringify({
  name, line1, line2, city, state, zip, country, phone
}))
```

The payment page reads it when calling `/api/orders/confirm` after payment succeeds.

**Why sessionStorage, not Zustand?**

- sessionStorage is cleared when the browser tab closes — appropriate for one-shot checkout data
- Persisting shipping to localStorage (via Zustand `persist`) would leave stale addresses after checkout
- The shipping address is already stored in the DB in `ShippingAddress` once the order is created — no need to keep it in client state

---

## No Server-Side Cart Sync (Yet)

The database has `Cart` and `CartItem` models (see [Database](./database.md)), but they are not currently wired to the Zustand store. The client-side localStorage cart is the only active cart mechanism.

Future server-side cart sync would enable:
- Abandoned cart emails (can read DB cart server-side)
- Cart sharing across devices
- Server-side coupon validation without waiting for checkout
- Guest-to-account cart merging on login

See [Scalability](./scalability.md) for the migration path.
