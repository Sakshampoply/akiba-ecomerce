import Link from "next/link"
import { redirect } from "next/navigation"
import { Package, MapPin, User, ArrowRight, ShoppingBag } from "lucide-react"
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

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/account")

  const [orders, addressCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.address.count({ where: { userId: session.user.id } }),
  ])

  const inTransit = orders.filter((o) => o.status === "SHIPPED" || o.status === "PROCESSING").length
  const totalOrders = await prisma.order.count({ where: { userId: session.user.id } })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">My Account</p>
        <h1 className="text-3xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
          Welcome back, {session.user.name?.split(" ")[0] ?? "Collector"}
        </h1>
        <p className="text-sm text-[#555577] mt-1">{session.user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: ShoppingBag, label: "Total Orders", value: String(totalOrders), href: "/account/orders" },
          { icon: Package, label: "In Transit", value: String(inTransit), href: "/account/orders" },
          { icon: MapPin, label: "Saved Addresses", value: String(addressCount), href: "/account/addresses" },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center gap-4 p-5 rounded-sm border border-[#2a2a3d] bg-[#12121a] hover:border-[#ff2d55]/40 transition-all"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-sm bg-[#ff2d55]/10">
              <Icon className="w-5 h-5 text-[#ff2d55]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
                {value}
              </div>
              <div className="text-xs text-[#555577]">{label}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#555577] ml-auto group-hover:text-[#ff2d55] group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3d]">
          <h2 className="text-sm font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
            Recent Orders
          </h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="text-xs text-[#ff2d55] hover:text-[#ff4d6d] transition-colors">
              View all →
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <ShoppingBag className="w-10 h-10 text-[#2a2a3d] mb-3" />
            <p className="text-sm font-semibold text-[#f0f0ff] mb-1">No orders yet</p>
            <p className="text-xs text-[#555577] mb-4">Your completed orders will appear here.</p>
            <Button size="sm" asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a27]">
            {orders.map((order) => {
              const firstItem = order.items[0]
              const slug = firstItem?.product?.slug ?? ""
              const emoji = EMOJI_MAP[slug] ?? "📦"
              const status = STATUS_CONFIG[order.status] ?? { variant: "dark" as const }

              return (
                <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#1a1a27] transition-colors">
                  <div className="w-10 h-10 rounded-sm bg-[#1a1a27] border border-[#2a2a3d] flex items-center justify-center text-xl shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-[#ff2d55]">{order.orderNumber}</span>
                      <Badge variant={status.variant}>{order.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="text-xs text-[#8888aa] truncate">
                      {firstItem?.productName ?? "—"}
                      {order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </div>
                    <div className="text-[10px] text-[#555577] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <div className="text-sm font-black text-[#f0f0ff] shrink-0">{formatPrice(order.totalCents)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-[#ff2d55]" />
            <h2 className="text-sm font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Profile</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[#555577] mb-0.5">Name</div>
            <div className="text-[#f0f0ff] font-semibold">{session.user.name ?? "—"}</div>
          </div>
          <div>
            <div className="text-[#555577] mb-0.5">Email</div>
            <div className="text-[#f0f0ff] font-semibold">{session.user.email}</div>
          </div>
          <div>
            <div className="text-[#555577] mb-0.5">Account type</div>
            <div className="text-[#f0f0ff] font-semibold capitalize">{session.user.role.toLowerCase()}</div>
          </div>
          <div>
            <div className="text-[#555577] mb-0.5">Member since</div>
            <div className="text-[#f0f0ff] font-semibold">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
