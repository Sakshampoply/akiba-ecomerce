import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string         // variantId used as key
  productId: string
  variantId: string
  productName: string
  variantLabel: string
  price: number      // cents
  compareAt?: number
  quantity: number
  emoji?: string
  imageUrl?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotalCents: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, id: item.variantId, quantity: item.quantity ?? 1 }] }
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCents: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "akiba-cart" }
  )
)
