import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShoppingBag, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "success" | "gold" | "error" | "dark" | "outline" }> = {
  PENDING: { variant: "outline" },
  PAYMENT_PROCESSING: { variant: "outline" },
  PAID: { variant: "gold" },
  PROCESSING: { variant: "gold" },
  SHIPPED: { variant: "secondary" },
  DELIVERED: { variant: "success" },
  CANCELLED: { variant: "error" },
  REFUNDED: { variant: "error" },
}

const EMOJI_MAP: Record<string, string> = {
  "tanjiro-kamado-1-7-scale": "⚔️",
  "gojo-satoru-nendoroid": "🔵",
  "survey-corps-hoodie": "🎌",
  "pochita-plush-premium": "🪚",
  "naruto-sage-mode-1-4-scale": "🍃",
  "deku-full-cowling-figure": "💪",
  "breath-of-sun-tee": "🌅",
  "luffy-gear5-pop-figure": "🏴‍☠️",
  "anya-forger-nendoroid": "😏",
  "akiba-tote-bag-logo": "👜",
}

export default async function AccountOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/account/orders")

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: true } },
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-[#555577] hover:text-[#f0f0ff] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">My Account</p>
          <h1 className="text-3xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Order History</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="w-16 h-16 text-[#2a2a3d] mb-4" />
          <h2 className="text-xl font-black text-[#f0f0ff] mb-2">No orders yet</h2>
          <p className="text-sm text-[#555577] mb-6">Your orders will appear here after you complete a purchase.</p>
          <Button asChild><Link href="/products">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] ?? { variant: "dark" as const }
            return (
              <div key={order.id} className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
                {/* Order header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3d]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-[#ff2d55]">{order.orderNumber}</span>
                    <Badge variant={status.variant}>{order.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#f0f0ff]">{formatPrice(order.totalCents)}</div>
                    <div className="text-[10px] text-[#555577]">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#1a1a27]">
                  {order.items.map((item) => {
                    const slug = item.product?.slug ?? ""
                    const emoji = EMOJI_MAP[slug] ?? "📦"
                    return (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-3">
                        <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#1a1a27] to-[#0a0a0f] flex items-center justify-center text-xl shrink-0">
                          {emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#f0f0ff] truncate">{item.productName}</p>
                          <p className="text-xs text-[#555577]">{item.variantLabel} · Qty {item.quantity}</p>
                        </div>
                        <div className="text-sm font-semibold text-[#f0f0ff] shrink-0">{formatPrice(item.totalCents)}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Totals + address */}
                <div className="px-6 py-4 bg-[#0d0d17] border-t border-[#2a2a3d]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-[#555577]">Subtotal</span><span className="text-[#f0f0ff]">{formatPrice(order.subtotalCents)}</span></div>
                      {order.discountCents > 0 && <div className="flex justify-between"><span className="text-[#10b981]">Discount</span><span className="text-[#10b981]">-{formatPrice(order.discountCents)}</span></div>}
                      <div className="flex justify-between"><span className="text-[#555577]">Shipping</span><span className="text-[#f0f0ff]">{order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents)}</span></div>
                      <div className="flex justify-between"><span className="text-[#555577]">Tax</span><span className="text-[#f0f0ff]">{formatPrice(order.taxCents)}</span></div>
                      <div className="flex justify-between font-bold border-t border-[#2a2a3d] pt-1 mt-1"><span className="text-[#f0f0ff]">Total</span><span className="text-[#f0f0ff]">{formatPrice(order.totalCents)}</span></div>
                    </div>
                    {order.shippingAddress && (
                      <div className="text-xs text-[#555577]">
                        <div className="flex items-center gap-1 text-[#f0f0ff] font-semibold mb-1">
                          <Package className="w-3 h-3" /> Ship to
                        </div>
                        <p>{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
