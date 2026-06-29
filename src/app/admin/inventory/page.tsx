import { AlertTriangle, Package, TrendingDown, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { StockInput } from "./StockInput"

export const dynamic = "force-dynamic"

export default async function AdminInventoryPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { stock: "asc" },
  })

  const outOfStock = variants.filter((v) => v.stock === 0)
  const lowStock = variants.filter((v) => v.stock > 0 && v.stock <= 5)
  const healthy = variants.filter((v) => v.stock > 5)
  const totalUnits = variants.reduce((s, v) => s + v.stock, 0)
  const totalValue = variants.reduce((s, v) => s + v.stock * v.price, 0)

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Stock</p>
        <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
          Inventory
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total SKUs", value: variants.length, icon: Package, color: "text-[#7c3aed]" },
          { label: "Total Units", value: totalUnits.toLocaleString(), icon: CheckCircle, color: "text-[#10b981]" },
          { label: "Low Stock", value: lowStock.length, icon: TrendingDown, color: "text-[#f59e0b]" },
          { label: "Out of Stock", value: outOfStock.length, icon: AlertTriangle, color: "text-[#ef4444]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#555577] font-semibold uppercase tracking-wider">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Inventory value */}
      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-5">
        <p className="text-xs text-[#555577] font-semibold uppercase tracking-wider mb-1">Total Inventory Value</p>
        <div className="text-3xl font-black text-[#10b981]" style={{ fontFamily: "var(--font-syne)" }}>
          {formatPrice(totalValue)}
        </div>
        <p className="text-xs text-[#555577] mt-1">At retail price across all variants</p>
      </div>

      {/* Out of stock alert */}
      {outOfStock.length > 0 && (
        <div className="rounded-sm border border-[#ef4444]/30 bg-[#ef4444]/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
            <span className="text-sm font-bold text-[#ef4444]">{outOfStock.length} SKU{outOfStock.length !== 1 ? "s" : ""} out of stock</span>
          </div>
          <div className="space-y-2">
            {outOfStock.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-xs">
                <span className="text-[#f0f0ff]">{v.product.name} — {v.sku}</span>
                <Badge variant="error">OOS</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3d]">
          <h2 className="text-sm font-black text-[#f0f0ff]">All Variants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2a3d]">
                {["Product", "SKU", "Size / Edition", "Price", "Stock (editable)", "Value", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[#555577] font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a27]">
              {variants.map((v) => {
                const isOut = v.stock === 0
                const isLow = v.stock > 0 && v.stock <= 5
                return (
                  <tr key={v.id} className="hover:bg-[#1a1a27] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#f0f0ff] max-w-[200px] truncate">
                      {v.product.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#555577]">{v.sku}</td>
                    <td className="px-4 py-3 text-[#8888aa]">{v.size ?? "Standard"}</td>
                    <td className="px-4 py-3 text-[#f0f0ff] font-semibold">{formatPrice(v.price)}</td>
                    <td className="px-4 py-3">
                      <StockInput variantId={v.id} initialStock={v.stock} />
                    </td>
                    <td className="px-4 py-3 text-[#8888aa]">{formatPrice(v.stock * v.price)}</td>
                    <td className="px-4 py-3">
                      {isOut ? (
                        <Badge variant="error">Out of Stock</Badge>
                      ) : isLow ? (
                        <Badge variant="gold">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
