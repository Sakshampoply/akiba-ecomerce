import { TrendingUp, ShoppingBag, Users, DollarSign, ArrowUpRight, ArrowDownRight, Package, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

const STATS = [
  {
    label: "Revenue (30d)",
    value: formatPrice(284500),
    change: "+12.4%",
    up: true,
    icon: DollarSign,
    accent: "#ff2d55",
  },
  {
    label: "Orders (30d)",
    value: "1,284",
    change: "+8.1%",
    up: true,
    icon: ShoppingBag,
    accent: "#7c3aed",
  },
  {
    label: "New Customers",
    value: "342",
    change: "+23.5%",
    up: true,
    icon: Users,
    accent: "#10b981",
  },
  {
    label: "Avg Order Value",
    value: formatPrice(22160),
    change: "-3.2%",
    up: false,
    icon: TrendingUp,
    accent: "#f59e0b",
  },
]

const RECENT_ORDERS = [
  { id: "AKB-98241", customer: "Sakura M.", product: "Tanjiro 1/7 Scale", total: 18900, status: "SHIPPED", date: "2 min ago" },
  { id: "AKB-98240", customer: "Alex K.", product: "Gojo Nendoroid × 2", total: 17000, status: "PAID", date: "15 min ago" },
  { id: "AKB-98239", customer: "Kenji T.", product: "Survey Corps Hoodie", total: 6800, status: "PROCESSING", date: "1 hr ago" },
  { id: "AKB-98238", customer: "Maria L.", product: "Pochita Plush × 3", total: 12600, status: "DELIVERED", date: "2 hr ago" },
  { id: "AKB-98237", customer: "David W.", product: "Naruto Sage 1/4", total: 42000, status: "PAID", date: "3 hr ago" },
]

const TOP_PRODUCTS = [
  { name: "Pochita Plush Premium", sales: 876, revenue: 3679200, emoji: "🪚" },
  { name: "Gojo Satoru Nendoroid", sales: 512, revenue: 4352000, emoji: "🔵" },
  { name: "Tanjiro 1/7 Scale", sales: 248, revenue: 4687200, emoji: "⚔️" },
  { name: "Luffy Gear 5 POP!", sales: 1240, revenue: 3472000, emoji: "🏴‍☠️" },
  { name: "Survey Corps Hoodie", sales: 183, revenue: 1244400, emoji: "🎌" },
]

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "success" | "gold" | "error" | "dark" | "outline"; label: string }> = {
  SHIPPED: { variant: "secondary", label: "Shipped" },
  PAID: { variant: "success", label: "Paid" },
  PROCESSING: { variant: "gold", label: "Processing" },
  DELIVERED: { variant: "dark", label: "Delivered" },
  CANCELLED: { variant: "error", label: "Cancelled" },
}

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Overview</p>
        <h1
          className="text-2xl font-black text-[#f0f0ff]"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Dashboard
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, change, up, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-sm"
                style={{ background: `${accent}15` }}
              >
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-[#10b981]" : "text-[#ef4444]"}`}
              >
                {up ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {change}
              </div>
            </div>
            <div>
              <div
                className="text-2xl font-black text-[#f0f0ff]"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {value}
              </div>
              <div className="text-xs text-[#555577] mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2 rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3d]">
            <h2
              className="text-sm font-black text-[#f0f0ff]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Recent Orders
            </h2>
            <a href="/admin/orders" className="text-xs text-[#ff2d55] hover:text-[#ff4d6d] transition-colors">
              View all →
            </a>
          </div>
          <div className="divide-y divide-[#1a1a27]">
            {RECENT_ORDERS.map((order) => {
              const status = STATUS_CONFIG[order.status] || { variant: "dark" as const, label: order.status }
              return (
                <div key={order.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a27] transition-colors">
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-sm bg-[#1a1a27] border border-[#2a2a3d]">
                    <Package className="w-3.5 h-3.5 text-[#555577]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#ff2d55]">{order.id}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="text-xs text-[#f0f0ff] mt-0.5 truncate">{order.customer} — {order.product}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#f0f0ff]">{formatPrice(order.total)}</div>
                    <div className="text-[10px] text-[#555577] flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-2.5 h-2.5" />{order.date}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3d]">
            <h2
              className="text-sm font-black text-[#f0f0ff]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Top Products
            </h2>
          </div>
          <div className="divide-y divide-[#1a1a27]">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-6 py-3">
                <span className="text-xs font-bold text-[#555577] w-4">{i + 1}</span>
                <span className="text-lg">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#f0f0ff] truncate">{p.name}</div>
                  <div className="text-[10px] text-[#555577]">{p.sales} sales</div>
                </div>
                <div className="text-xs font-black text-[#f0f0ff] shrink-0">
                  {formatPrice(p.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
