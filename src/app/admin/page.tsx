import Link from "next/link"
import { TrendingUp, ShoppingBag, Users, DollarSign, ArrowUpRight, Package, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "success" | "gold" | "error" | "dark" | "outline"; label: string }> = {
  SHIPPED: { variant: "secondary", label: "Shipped" },
  PAID: { variant: "success", label: "Paid" },
  PROCESSING: { variant: "gold", label: "Processing" },
  PAYMENT_PROCESSING: { variant: "outline", label: "Processing" },
  DELIVERED: { variant: "dark", label: "Delivered" },
  CANCELLED: { variant: "error", label: "Cancelled" },
  PENDING: { variant: "outline", label: "Pending" },
  REFUNDED: { variant: "error", label: "Refunded" },
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

export default async function AdminDashboard() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [monthStats, totalStats, newCustomers, totalCustomers, recentOrders, topProducts] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true, items: { take: 1, include: { product: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { totalCents: true, quantity: true },
      orderBy: { _sum: { totalCents: "desc" } },
      take: 5,
    }),
  ])

  const monthRevenue = monthStats._sum.totalCents ?? 0
  const monthOrders = monthStats._count
  const avgOrderValue = totalStats._count > 0 ? Math.round((totalStats._sum.totalCents ?? 0) / totalStats._count) : 0

  const STATS = [
    { label: "Revenue (30d)", value: formatPrice(monthRevenue), icon: DollarSign, accent: "#ff2d55" },
    { label: "Orders (30d)", value: monthOrders.toLocaleString(), icon: ShoppingBag, accent: "#7c3aed" },
    { label: "New Customers (30d)", value: newCustomers.toLocaleString(), icon: Users, accent: "#10b981" },
    { label: "Avg Order Value", value: formatPrice(avgOrderValue), icon: TrendingUp, accent: "#f59e0b" },
  ]

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Overview</p>
        <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Dashboard</h1>
        <p className="text-xs text-[#555577] mt-1">
          {totalCustomers} total customers · {totalStats._count} total orders · {formatPrice(totalStats._sum.totalCents ?? 0)} lifetime revenue
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center w-9 h-9 rounded-sm" style={{ background: `${accent}15` }}>
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <ArrowUpRight className="w-3 h-3 text-[#555577]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>{value}</div>
              <div className="text-xs text-[#555577] mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3d]">
            <h2 className="text-sm font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#ff2d55] hover:text-[#ff4d6d] transition-colors">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#555577]">No orders yet. Complete a checkout to see orders here.</div>
          ) : (
            <div className="divide-y divide-[#1a1a27]">
              {recentOrders.map((order) => {
                const status = STATUS_CONFIG[order.status] ?? { variant: "dark" as const, label: order.status }
                const firstItem = order.items[0]
                return (
                  <div key={order.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a27] transition-colors">
                    <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-sm bg-[#1a1a27] border border-[#2a2a3d]">
                      <Package className="w-3.5 h-3.5 text-[#555577]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#ff2d55]">{order.orderNumber}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="text-xs text-[#f0f0ff] mt-0.5 truncate">
                        {order.user?.name ?? order.user?.email ?? "Guest"} — {firstItem?.productName ?? "—"}
                        {order.items.length > 1 && ` +${order.items.length - 1}`}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-[#f0f0ff]">{formatPrice(order.totalCents)}</div>
                      <div className="text-[10px] text-[#555577] flex items-center gap-1 justify-end mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3d]">
            <h2 className="text-sm font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Top Products</h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#555577]">No sales yet.</div>
          ) : (
            <div className="divide-y divide-[#1a1a27]">
              {topProducts.map((p, i) => {
                const matchedItem = recentOrders.flatMap((o) => o.items).find((it) => it.productId === p.productId)
                const slug = matchedItem?.product?.slug ?? ""
                return (
                  <div key={p.productId} className="flex items-center gap-3 px-6 py-3">
                    <span className="text-xs font-bold text-[#555577] w-4">{i + 1}</span>
                    <span className="text-lg">{EMOJI_MAP[slug] ?? "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#f0f0ff] truncate">{p.productName}</div>
                      <div className="text-[10px] text-[#555577]">{p._sum?.quantity ?? 0} units sold</div>
                    </div>
                    <div className="text-xs font-black text-[#f0f0ff] shrink-0">{formatPrice(p._sum?.totalCents ?? 0)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
