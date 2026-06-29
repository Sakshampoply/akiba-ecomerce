import Link from "next/link"
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

const CART_ITEMS = [
  {
    id: "1",
    name: "Demon Slayer — Tanjiro Kamado 1/7 Scale Figure",
    variant: "Standard Edition",
    sku: "GSC-DMS-TKM-17-STD",
    price: 18900,
    quantity: 1,
    emoji: "⚔️",
    gradient: "from-[#1a0a1a] to-[#2d1a2d]",
    stock: 12,
  },
  {
    id: "2",
    name: "Chainsaw Man — Pochita Plush Premium",
    variant: "One Size",
    sku: "BDI-CSM-PCT-PLX",
    price: 4200,
    quantity: 2,
    emoji: "🪚",
    gradient: "from-[#1a0a0a] to-[#2d1a0a]",
    stock: 6,
  },
]

const subtotal = CART_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0)
const shipping = subtotal > 7500 ? 0 : 799
const tax = Math.round(subtotal * 0.08)
const total = subtotal + shipping + tax

export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Cart</p>
        <h1
          className="text-3xl font-black text-[#f0f0ff]"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Your Cart
        </h1>
        <p className="text-sm text-[#555577] mt-1">{CART_ITEMS.length} items</p>
      </div>

      {CART_ITEMS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingCart className="w-16 h-16 text-[#2a2a3d] mb-4" />
          <h2 className="text-xl font-black text-[#f0f0ff] mb-2">Your cart is empty</h2>
          <p className="text-sm text-[#555577] mb-6">Add some anime merch to get started.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {CART_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-sm border border-[#2a2a3d] bg-[#12121a]"
              >
                {/* Image */}
                <Link href={`/products/${item.id}`}>
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-sm bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl`}
                  >
                    {item.emoji}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#f0f0ff] leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#555577] mt-0.5">{item.variant}</p>
                      <p className="text-[10px] text-[#555577]/60 font-mono mt-0.5">{item.sku}</p>
                    </div>
                    <button className="text-[#555577] hover:text-[#ef4444] transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#2a2a3d] rounded-sm">
                      <button className="flex items-center justify-center w-8 h-8 text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-[#f0f0ff]">
                        {item.quantity}
                      </span>
                      <button className="flex items-center justify-center w-8 h-8 text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-sm font-black text-[#f0f0ff]">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-[#555577]">{formatPrice(item.price)} each</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link
              href="/products"
              className="flex items-center gap-2 text-sm text-[#8888aa] hover:text-[#ff2d55] transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6 space-y-4">
              <h2
                className="text-base font-black text-[#f0f0ff]"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                Order Summary
              </h2>

              {/* Coupon */}
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-[#555577] mb-2">
                  Coupon Code
                </p>
                <div className="flex gap-2">
                  <Input placeholder="AKIBA10" className="h-9 text-xs flex-1" />
                  <Button size="sm" variant="outline" className="shrink-0 gap-1">
                    <Tag className="w-3 h-3" />
                    Apply
                  </Button>
                </div>
              </div>

              <div className="border-t border-[#2a2a3d] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8888aa]">Subtotal</span>
                  <span className="text-[#f0f0ff] font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8888aa]">Shipping</span>
                  <span className="text-[#f0f0ff] font-semibold">
                    {shipping === 0 ? (
                      <span className="text-[#10b981]">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8888aa]">Tax (8%)</span>
                  <span className="text-[#f0f0ff] font-semibold">{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="border-t border-[#2a2a3d] pt-4 flex justify-between">
                <span
                  className="font-black text-[#f0f0ff]"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  Total
                </span>
                <span
                  className="font-black text-xl text-[#f0f0ff]"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {formatPrice(total)}
                </span>
              </div>

              {shipping > 0 && (
                <div className="p-3 rounded-sm bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                  <p className="text-xs text-[#f59e0b]">
                    Add {formatPrice(7500 - subtotal)} more for free shipping!
                  </p>
                </div>
              )}

              <Button size="lg" className="w-full gap-2" asChild>
                <Link href="/checkout/shipping">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <p className="text-[10px] text-[#555577] text-center">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
