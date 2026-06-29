import { Search, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

const ORDERS = [
  { id: "AKB-98241", customer: "Sakura M.", email: "sakura@mail.com", items: 1, total: 18900, status: "SHIPPED", date: "Jun 29, 2024" },
  { id: "AKB-98240", customer: "Alex K.", email: "alex@mail.com", items: 2, total: 17000, status: "PAID", date: "Jun 29, 2024" },
  { id: "AKB-98239", customer: "Kenji T.", email: "kenji@mail.com", items: 1, total: 6800, status: "PROCESSING", date: "Jun 28, 2024" },
  { id: "AKB-98238", customer: "Maria L.", email: "maria@mail.com", items: 3, total: 12600, status: "DELIVERED", date: "Jun 28, 2024" },
  { id: "AKB-98237", customer: "David W.", email: "david@mail.com", items: 1, total: 42000, status: "PAID", date: "Jun 27, 2024" },
  { id: "AKB-98236", customer: "Yuki N.", email: "yuki@mail.com", items: 2, total: 8900, status: "CANCELLED", date: "Jun 27, 2024" },
]

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "success" | "gold" | "error" | "dark" | "outline" }> = {
  SHIPPED: { variant: "secondary" },
  PAID: { variant: "success" },
  PROCESSING: { variant: "gold" },
  DELIVERED: { variant: "dark" },
  CANCELLED: { variant: "error" },
  PENDING: { variant: "outline" },
}

export default function AdminOrdersPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Management</p>
          <h1
            className="text-2xl font-black text-[#f0f0ff]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Orders
          </h1>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555577]" />
          <Input placeholder="Search orders or customers…" className="pl-9 h-9 text-xs" />
        </div>
        <select className="text-xs bg-[#12121a] border border-[#2a2a3d] text-[#8888aa] rounded-sm px-3 py-2 focus:outline-none focus:border-[#ff2d55]">
          <option>All Status</option>
          <option>Pending</option>
          <option>Paid</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      </div>

      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3d]">
                {["Order #", "Customer", "Items", "Total", "Status", "Date", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-[#555577]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a27]">
              {ORDERS.map((order) => {
                const status = STATUS_CONFIG[order.status] || { variant: "dark" as const }
                return (
                  <tr key={order.id} className="hover:bg-[#1a1a27] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold text-[#ff2d55]">{order.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-xs font-semibold text-[#f0f0ff]">{order.customer}</div>
                        <div className="text-[10px] text-[#555577]">{order.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#8888aa]">{order.items} item{order.items !== 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-black text-[#f0f0ff]">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>{order.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#555577]">{order.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#f0f0ff] hover:bg-[#2a2a3d] transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a3d]">
          <span className="text-xs text-[#555577]">Showing {ORDERS.length} orders</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-sm text-xs font-semibold transition-all ${
                  p === 1 ? "bg-[#ff2d55] text-white" : "text-[#8888aa] hover:bg-[#1a1a27]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
