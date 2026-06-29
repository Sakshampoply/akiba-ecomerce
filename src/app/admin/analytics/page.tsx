import { TrendingUp, ShoppingBag, Users, DollarSign, Package, BarChart2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    allOrders,
    monthOrders,
    lastMonthOrders,
    totalUsers,
    newUsersThisMonth,
    topProducts,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalCents: true }, _count: true }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true, totalCents: true },
      orderBy: { _sum: { totalCents: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: { take: 1 } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ])

  const totalRevenue = allOrders._sum.totalCents ?? 0
  const monthRevenue = monthOrders._sum.totalCents ?? 0
  const lastMonthRevenue = lastMonthOrders._sum.totalCents ?? 0
  const revenueGrowth = lastMonthRevenue > 0
    ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : null

  const STATUS_COLOR: Record<string, string> = {
    PENDING: "#555577",
    PAYMENT_PROCESSING: "#7c3aed",
    PAID: "#f59e0b",
    PROCESSING: "#f59e0b",
    SHIPPED: "#7c3aed",
    DELIVERED: "#10b981",
    CANCELLED: "#ef4444",
    REFUNDED: "#ef4444",
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Insights</p>
        <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
          Analytics
        </h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatPrice(totalRevenue),
            sub: "All time",
            icon: DollarSign,
            color: "text-[#10b981]",
          },
          {
            label: "This Month",
            value: formatPrice(monthRevenue),
            sub: revenueGrowth !== null
              ? `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% vs last month`
              : "First month",
            icon: TrendingUp,
            color: revenueGrowth !== null && revenueGrowth >= 0 ? "text-[#10b981]" : "text-[#ef4444]",
          },
          {
            label: "Total Orders",
            value: allOrders._count.toLocaleString(),
            sub: `${monthOrders._count} this month`,
            icon: ShoppingBag,
            color: "text-[#7c3aed]",
          },
          {
            label: "Total Customers",
            value: totalUsers.toLocaleString(),
            sub: `+${newUsersThisMonth} this month`,
            icon: Users,
            color: "text-[#ff2d55]",
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#555577] font-semibold uppercase tracking-wider">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-2xl font-black ${color}`} style={{ fontFamily: "var(--font-syne)" }}>
              {value}
            </div>
            <p className="text-[10px] text-[#555577] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-[#ff2d55]" />
            <h2 className="text-sm font-black text-[#f0f0ff]">Top Products by Revenue</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-xs text-[#555577]">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const revenue = p._sum?.totalCents ?? 0
                const max = topProducts[0]._sum?.totalCents ?? 1
                const pct = Math.round((revenue / max) * 100)
                return (
                  <div key={p.productId}>
                    <div className="flex justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center font-bold text-[#555577]">{i + 1}</span>
                        <span className="text-[#f0f0ff] truncate max-w-[160px]">{p.productName}</span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[#f0f0ff] font-semibold">{formatPrice(revenue)}</span>
                        <span className="text-[#555577] ml-1">({p._sum?.quantity ?? 0} units)</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1a1a27]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#ff2d55] to-[#7c3aed]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Orders by status */}
        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-[#ff2d55]" />
            <h2 className="text-sm font-black text-[#f0f0ff]">Orders by Status</h2>
          </div>
          {ordersByStatus.length === 0 ? (
            <p className="text-xs text-[#555577]">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {ordersByStatus
                .sort((a, b) => b._count - a._count)
                .map((s) => {
                  const total = ordersByStatus.reduce((sum, x) => sum + x._count, 0)
                  const pct = Math.round((s._count / total) * 100)
                  const color = STATUS_COLOR[s.status] ?? "#555577"
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#f0f0ff]">{s.status.replace(/_/g, " ")}</span>
                        <span className="text-[#555577]">{s._count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1a1a27]">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3d]">
          <h2 className="text-sm font-black text-[#f0f0ff]">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#555577]">No orders yet.</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2a3d]">
                {["Order", "Product", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[#555577] font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a27]">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#1a1a27] transition-colors">
                  <td className="px-4 py-3 font-mono text-[#ff2d55]">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-[#8888aa] truncate max-w-[180px]">
                    {o.items[0]?.productName ?? "—"}
                    {o.items.length > 1 && ` +${o.items.length - 1}`}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#f0f0ff]">{formatPrice(o.totalCents)}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-sm text-[10px] font-bold"
                      style={{
                        color: STATUS_COLOR[o.status] ?? "#555577",
                        backgroundColor: `${STATUS_COLOR[o.status] ?? "#555577"}20`,
                      }}
                    >
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#555577]">
                    {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
