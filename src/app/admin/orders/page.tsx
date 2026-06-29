import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { OrderStatusSelect } from "./OrderStatusSelect"

export const dynamic = "force-dynamic"

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "success" | "gold" | "error" | "dark" | "outline" }> = {
  PENDING: { variant: "outline" },
  PAYMENT_PROCESSING: { variant: "outline" },
  PAID: { variant: "success" },
  PROCESSING: { variant: "gold" },
  SHIPPED: { variant: "secondary" },
  DELIVERED: { variant: "dark" },
  CANCELLED: { variant: "error" },
  REFUNDED: { variant: "error" },
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const totalRevenue = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
    .reduce((s, o) => s + o.totalCents, 0)

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Management</p>
          <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Orders</h1>
          <p className="text-xs text-[#555577] mt-1">{orders.length} orders · {formatPrice(totalRevenue)} revenue</p>
        </div>
      </div>

      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#555577]">
            No orders yet. Orders appear here after customers complete checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a2a3d]">
                  {["Order #", "Customer", "Items", "Total", "Status", "Date", "Update Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#555577] font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a27]">
                {orders.map((order) => {
                  const status = STATUS_CONFIG[order.status] ?? { variant: "dark" as const }
                  return (
                    <tr key={order.id} className="hover:bg-[#1a1a27] transition-colors">
                      <td className="px-4 py-3 font-mono text-[#ff2d55] font-bold">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div className="text-[#f0f0ff] font-semibold">{order.user?.name ?? "Guest"}</div>
                        <div className="text-[#555577]">{order.user?.email ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-[#8888aa]">
                        {order.items[0]?.productName ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#f0f0ff]">{formatPrice(order.totalCents)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant}>{order.status.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[#555577]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
