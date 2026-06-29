import Link from "next/link"
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

const PRODUCTS = [
  { id: "1", name: "Demon Slayer — Tanjiro 1/7 Scale", sku: "GSC-DMS-TKM-17-STD", price: 18900, stock: 12, category: "Figures", isActive: true, emoji: "⚔️" },
  { id: "2", name: "JJK — Gojo Satoru Nendoroid", sku: "GSC-JJK-GJO-NDR", price: 8500, stock: 34, category: "Figures", isActive: true, emoji: "🔵" },
  { id: "3", name: "AoT — Survey Corps Hoodie", sku: "AKB-AOT-SCH-L", price: 6800, stock: 89, category: "Apparel", isActive: true, emoji: "🎌" },
  { id: "4", name: "Chainsaw Man — Pochita Plush", sku: "BDI-CSM-PCT-PLX", price: 4200, stock: 6, category: "Accessories", isActive: true, emoji: "🪚" },
  { id: "5", name: "Naruto — Sage Mode 1/4 Statue", sku: "P1S-NRT-SGM-14", price: 42000, stock: 0, category: "Figures", isActive: true, emoji: "🍃" },
  { id: "6", name: "MHA — Deku Full Cowling", sku: "KBY-MHA-DKU-FC", price: 15500, stock: 21, category: "Figures", isActive: false, emoji: "💪" },
]

export default function AdminProductsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Catalog</p>
          <h1
            className="text-2xl font-black text-[#f0f0ff]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Products
          </h1>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4" />
            New Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555577]" />
          <Input placeholder="Search products…" className="pl-9 h-9 text-xs" />
        </div>
        <select className="text-xs bg-[#12121a] border border-[#2a2a3d] text-[#8888aa] rounded-sm px-3 py-2 focus:outline-none focus:border-[#ff2d55]">
          <option>All Categories</option>
          <option>Figures</option>
          <option>Apparel</option>
          <option>Accessories</option>
        </select>
        <select className="text-xs bg-[#12121a] border border-[#2a2a3d] text-[#8888aa] rounded-sm px-3 py-2 focus:outline-none focus:border-[#ff2d55]">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3d]">
                {["Product", "SKU", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
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
              {PRODUCTS.map((p) => (
                <tr key={p.id} className="hover:bg-[#1a1a27] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#1a1a27] border border-[#2a2a3d] flex items-center justify-center text-base shrink-0">
                        {p.emoji}
                      </div>
                      <span className="text-xs font-semibold text-[#f0f0ff] max-w-[180px] truncate">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono text-[#555577]">{p.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="dark">{p.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-black text-[#f0f0ff]">{formatPrice(p.price)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold ${
                        p.stock === 0
                          ? "text-[#ef4444]"
                          : p.stock <= 10
                          ? "text-[#f59e0b]"
                          : "text-[#10b981]"
                      }`}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#f0f0ff] hover:bg-[#2a2a3d] transition-all">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#f0f0ff] hover:bg-[#2a2a3d] transition-all">
                        {p.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a3d]">
          <span className="text-xs text-[#555577]">Showing {PRODUCTS.length} of {PRODUCTS.length} products</span>
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
