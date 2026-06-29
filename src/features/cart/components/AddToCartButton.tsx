"use client"

import { ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/features/cart/store/cart.store"
import { useState } from "react"
import { toast } from "@/components/ui/toaster"

interface Props {
  productId: string
  variantId: string
  productName?: string
  price?: number
  disabled?: boolean
}

export function AddToCartButton({ productId, variantId, productName = "Item", price = 0, disabled }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({ id: variantId, productId, variantId, productName, variantLabel: "Standard", price })
    setAdded(true)
    toast({ title: "Added to cart", description: productName, variant: "success" })
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      size="lg"
      className="flex-1 gap-2 transition-all"
      onClick={handleAdd}
      disabled={disabled || added}
    >
      {added ? (
        <>
          <Check className="w-4 h-4" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          {disabled ? "Out of Stock" : "Add to Cart"}
        </>
      )}
    </Button>
  )
}
