"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  const [form, setForm] = useState({
    name: "", slug: "", brand: "", description: "", categoryId: "", isPreOrder: false,
    sku: "", price: "", compareAt: "", stock: "0", size: "",
  })

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {})
  }, [])

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: slugify(name) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.sku || !form.price) { setError("Name, SKU and price are required."); return }
    setLoading(true); setError("")

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        brand: form.brand,
        isPreOrder: form.isPreOrder,
        categoryId: form.categoryId || undefined,
        variants: [{
          sku: form.sku,
          price: parseFloat(form.price),
          compareAt: form.compareAt ? parseFloat(form.compareAt) : undefined,
          stock: parseInt(form.stock) || 0,
          size: form.size || undefined,
          isDefault: true,
        }],
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? "Failed to create product"); setLoading(false); return }
    router.push("/admin/products")
  }

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">{label}</label>
      <Input
        type={type}
        placeholder={placeholder}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-[#555577] hover:text-[#f0f0ff] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-0.5">Catalog</p>
          <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6 space-y-4">
          <h2 className="text-sm font-black text-[#f0f0ff]">Product Info</h2>
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Name *</label>
            <Input placeholder="e.g. Attack on Titan — Eren Figure" value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Slug (auto)</label>
            <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="font-mono text-xs" />
          </div>
          {field("Brand", "brand", "text", "e.g. Good Smile Company")}
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-sm border border-[#2a2a3d] bg-[#0a0a0f] px-3 py-2 text-sm text-[#f0f0ff] placeholder:text-[#555577] focus:outline-none focus:ring-1 focus:ring-[#ff2d55] resize-none"
              placeholder="Product description…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-sm border border-[#2a2a3d] bg-[#0a0a0f] px-3 py-2 text-sm text-[#f0f0ff] focus:outline-none focus:ring-1 focus:ring-[#ff2d55]"
            >
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPreOrder} onChange={(e) => setForm((f) => ({ ...f, isPreOrder: e.target.checked }))}
              className="w-4 h-4 rounded border-[#2a2a3d] bg-[#0a0a0f] accent-[#ff2d55]" />
            <span className="text-xs text-[#8888aa]">This is a pre-order product</span>
          </label>
        </div>

        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6 space-y-4">
          <h2 className="text-sm font-black text-[#f0f0ff]">Default Variant</h2>
          <div className="grid grid-cols-2 gap-4">
            {field("SKU *", "sku", "text", "e.g. GSC-AOT-ERN-17")}
            {field("Size / Edition", "size", "text", "e.g. L, XL, 1/7 Scale")}
            {field("Price (USD) *", "price", "number", "e.g. 89.99")}
            {field("Compare-at Price", "compareAt", "number", "e.g. 119.99")}
            {field("Initial Stock", "stock", "number", "0")}
          </div>
        </div>

        {error && <p className="text-sm text-[#ef4444] px-1">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating…" : "Create Product"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
