import Link from "next/link"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { AdminProductActions } from "./AdminProductActions"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      variants: { orderBy: { isDefault: "desc" } },
      categories: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Catalog</p>
          <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Products</h1>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4" /> New Product
          </Link>
        </Button>
      </div>

      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#555577] mb-4">No products yet.</p>
            <Button asChild size="sm"><Link href="/admin/products/new">Create your first product</Link></Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a2a3d]">
                  {["Product", "SKU", "Price", "Stock", "Category", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#555577] font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a27]">
                {products.map((p) => {
                  const defaultVariant = p.variants.find((v) => v.isDefault) ?? p.variants[0]
                  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
                  const category = p.categories[0]?.category?.name ?? "—"
                  return (
                    <tr key={p.id} className="hover:bg-[#1a1a27] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#f0f0ff] max-w-[200px] truncate">{p.name}</div>
                        {p.isPreOrder && <span className="text-[10px] text-[#7c3aed]">Pre-order</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#555577]">{defaultVariant?.sku ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-[#f0f0ff]">
                        {defaultVariant ? formatPrice(defaultVariant.price) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${totalStock === 0 ? "text-[#ef4444]" : totalStock <= 5 ? "text-[#f59e0b]" : "text-[#10b981]"}`}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8888aa]">{category}</td>
                      <td className="px-4 py-3">
                        {p.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="dark">Inactive</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <AdminProductActions productId={p.id} isActive={p.isActive} />
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
