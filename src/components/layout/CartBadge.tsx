"use client"

import { useCartStore } from "@/features/cart/store/cart.store"

export function CartBadge() {
  const totalItems = useCartStore((s) => s.totalItems())
  if (totalItems === 0) return null
  return (
    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-[#ff2d55] text-white text-[10px] font-bold">
      {totalItems > 9 ? "9+" : totalItems}
    </span>
  )
}
