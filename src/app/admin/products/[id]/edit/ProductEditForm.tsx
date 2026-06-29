"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"
import { ImageUploader, type ImageEntry } from "@/components/admin/ImageUploader"

type Variant = { id: string; sku: string; price: number; stock: number; size: string | null; isDefault: boolean }
type SavedImage = { id: string; url: string; altText: string | null; position: number }
type Product = { id: string; name: string; description: string; brand: string | null; isActive: boolean; isPreOrder: boolean; variants: Variant[]; images: SavedImage[]; categories: { category: { id: string; name: string } }[] }
type Category = { id: string; name: string }

export function ProductEditForm({ product, categories }: { product: Product; categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [savedImages, setSavedImages] = useState<SavedImage[]>(product.images)
  const [newImages, setNewImages] = useState<ImageEntry[]>([])

  const [form, setForm] = useState({
    name: product.name,
    brand: product.brand ?? "",
    description: product.description,
    isActive: product.isActive,
    isPreOrder: product.isPreOrder,
  })

  const [stockEdits, setStockEdits] = useState<Record<string, string>>({})

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(""); setSuccess("")

    // Save product info
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to update"); setLoading(false); return }

    // Save any new images
    for (const img of newImages) {
      await fetch(`/api/products/${product.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: img.url, altText: img.altText || product.name }),
      })
    }

    setNewImages([])
    setSuccess("Product updated!")
    router.refresh()
    setLoading(false)
  }

  async function deleteImage(imageId: string) {
    await fetch(`/api/products/${product.id}/images/${imageId}`, { method: "DELETE" })
    setSavedImages((imgs) => imgs.filter((i) => i.id !== imageId))
  }

  async function saveStock(variantId: string) {
    const stock = parseInt(stockEdits[variantId] ?? "0")
    if (isNaN(stock) || stock < 0) return
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, stock }),
    })
    setSuccess("Stock updated!")
    router.refresh()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-[#555577] hover:text-[#f0f0ff] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-0.5">Catalog</p>
          <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Edit Product</h1>
        </div>
      </div>

      <form onSubmit={saveProduct} className="space-y-6">
        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6 space-y-4">
          <h2 className="text-sm font-black text-[#f0f0ff]">Product Info</h2>
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Name</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Brand</label>
            <Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-sm border border-[#2a2a3d] bg-[#0a0a0f] px-3 py-2 text-sm text-[#f0f0ff] placeholder:text-[#555577] focus:outline-none focus:ring-1 focus:ring-[#ff2d55] resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-[#10b981]" />
              <span className="text-xs text-[#8888aa]">Active (visible in store)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPreOrder} onChange={(e) => setForm((f) => ({ ...f, isPreOrder: e.target.checked }))}
                className="w-4 h-4 accent-[#7c3aed]" />
              <span className="text-xs text-[#8888aa]">Pre-order</span>
            </label>
          </div>
        </div>

        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6 space-y-4">
          <h2 className="text-sm font-black text-[#f0f0ff]">Images</h2>
          <ImageUploader
            images={newImages}
            onChange={setNewImages}
            savedImages={savedImages}
            onDelete={deleteImage}
          />
        </div>

        {error && <p className="text-xs text-[#ef4444] px-1">{error}</p>}
        {success && <p className="text-xs text-[#10b981] px-1">{success}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Changes"}</Button>
          <Button type="button" variant="outline" asChild><Link href="/admin/products">Cancel</Link></Button>
        </div>
      </form>

      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6 space-y-4">
        <h2 className="text-sm font-black text-[#f0f0ff]">Variants & Stock</h2>
        <div className="space-y-3">
          {product.variants.map((v) => (
            <div key={v.id} className="flex items-center gap-4 p-3 rounded-sm bg-[#1a1a27] border border-[#2a2a3d]">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-[#555577]">{v.sku}</div>
                <div className="text-sm font-semibold text-[#f0f0ff]">
                  {v.size ?? "Standard"} — {formatPrice(v.price)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs text-[#555577]">Stock:</label>
                <input
                  type="number"
                  min="0"
                  defaultValue={v.stock}
                  onChange={(e) => setStockEdits((s) => ({ ...s, [v.id]: e.target.value }))}
                  className="w-20 rounded-sm border border-[#2a2a3d] bg-[#0a0a0f] px-2 py-1 text-xs text-[#f0f0ff] text-right focus:outline-none focus:border-[#ff2d55]"
                />
                <Button size="sm" variant="outline" onClick={() => saveStock(v.id)} className="text-xs h-7 px-2">Save</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
