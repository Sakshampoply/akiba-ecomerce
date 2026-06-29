import Link from "next/link"
import { Package, MapPin, User, ArrowRight, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

const RECENT_ORDERS = [
  { id: "AKB-98241", product: "Tanjiro 1/7 Scale", total: 18900, status: "SHIPPED", date: "Jun 29, 2024", emoji: "⚔️" },
  { id: "AKB-97801", product: "Pochita Plush × 2", total: 8400, status: "DELIVERED", date: "Jun 15, 2024", emoji: "🪚" },
]

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "success" | "gold" | "error" | "dark" | "outline" }> = {
  SHIPPED: { variant: "secondary" },
  DELIVERED: { variant: "success" },
  PAID: { variant: "gold" },
}

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">My Account</p>
        <h1
          className="text-3xl font-black text-[#f0f0ff]"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Welcome back, Saksham
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: ShoppingBag, label: "Total Orders", value: "12", href: "/account/orders" },
          { icon: Package, label: "In Transit", value: "1", href: "/account/orders" },
          { icon: MapPin, label: "Saved Addresses", value: "2", href: "/account/addresses" },
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
              <div
                className="text-2xl font-black text-[#f0f0ff]"
                style={{ fontFamily: "var(--font-syne)" }}
              >
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
          <h2
            className="text-sm font-black text-[#f0f0ff]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Recent Orders
          </h2>
          <Link href="/account/orders" className="text-xs text-[#ff2d55] hover:text-[#ff4d6d] transition-colors">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-[#1a1a27]">
          {RECENT_ORDERS.map((order) => {
            const status = STATUS_CONFIG[order.status] || { variant: "dark" as const }
            return (
              <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#1a1a27] transition-colors">
                <div className="w-10 h-10 rounded-sm bg-[#1a1a27] border border-[#2a2a3d] flex items-center justify-center text-xl shrink-0">
                  {order.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-[#ff2d55]">{order.id}</span>
                    <Badge variant={status.variant}>{order.status}</Badge>
                  </div>
                  <div className="text-xs text-[#8888aa] truncate">{order.product}</div>
                  <div className="text-[10px] text-[#555577] mt-0.5">{order.date}</div>
                </div>
                <div className="text-sm font-black text-[#f0f0ff] shrink-0">{formatPrice(order.total)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Profile quick edit */}
      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-4 h-4 text-[#ff2d55]" />
          <h2
            className="text-sm font-black text-[#f0f0ff]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Profile
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-[#555577] mb-0.5">Name</div>
            <div className="text-[#f0f0ff] font-semibold">Saksham Poply</div>
          </div>
          <div>
            <div className="text-[#555577] mb-0.5">Email</div>
            <div className="text-[#f0f0ff] font-semibold">forge@lforlearning.life</div>
          </div>
          <div>
            <div className="text-[#555577] mb-0.5">Member since</div>
            <div className="text-[#f0f0ff] font-semibold">January 2024</div>
          </div>
          <div>
            <div className="text-[#555577] mb-0.5">Account type</div>
            <div className="text-[#f0f0ff] font-semibold">Collector</div>
          </div>
        </div>
      </div>
    </div>
  )
}
