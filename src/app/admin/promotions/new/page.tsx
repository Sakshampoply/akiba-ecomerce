"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewCouponPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    code: "", type: "PERCENTAGE", value: "", minOrderCents: "", maxUsage: "", expiresAt: "", isActive: true,
  })

  const valueLabel = form.type === "PERCENTAGE" ? "Discount %" : form.type === "FIXED_AMOUNT" ? "Discount Amount (USD)" : "N/A (free shipping)"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code || (!form.value && form.type !== "FREE_SHIPPING")) { setError("Code and value are required."); return }
    setLoading(true); setError("")

    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: form.type === "FREE_SHIPPING" ? 0 : parseFloat(form.value),
        minOrderCents: form.minOrderCents ? parseFloat(form.minOrderCents) : undefined,
        maxUsage: form.maxUsage ? parseInt(form.maxUsage) : undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: form.isActive,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? "Failed to create coupon"); setLoading(false); return }
    router.push("/admin/promotions")
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/promotions" className="text-[#555577] hover:text-[#f0f0ff] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-0.5">Discounts</p>
          <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>New Coupon</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Code *</label>
          <Input
            placeholder="e.g. SUMMER25"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            className="font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Discount Type *</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full rounded-sm border border-[#2a2a3d] bg-[#0a0a0f] px-3 py-2 text-sm text-[#f0f0ff] focus:outline-none focus:ring-1 focus:ring-[#ff2d55]"
          >
            <option value="PERCENTAGE">Percentage off</option>
            <option value="FIXED_AMOUNT">Fixed amount off</option>
            <option value="FREE_SHIPPING">Free shipping</option>
          </select>
        </div>

        {form.type !== "FREE_SHIPPING" && (
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">{valueLabel} *</label>
            <Input type="number" min="0" placeholder={form.type === "PERCENTAGE" ? "10" : "20.00"} value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Min Order (USD)</label>
            <Input type="number" min="0" placeholder="50.00" value={form.minOrderCents}
              onChange={(e) => setForm((f) => ({ ...f, minOrderCents: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Max Uses</label>
            <Input type="number" min="1" placeholder="Unlimited" value={form.maxUsage}
              onChange={(e) => setForm((f) => ({ ...f, maxUsage: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1.5">Expires At</label>
          <Input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="w-4 h-4 accent-[#10b981]" />
          <span className="text-xs text-[#8888aa]">Active (usable at checkout immediately)</span>
        </label>

        {error && <p className="text-xs text-[#ef4444]">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={loading} className="flex-1">{loading ? "Creating…" : "Create Coupon"}</Button>
          <Button type="button" variant="outline" asChild><Link href="/admin/promotions">Cancel</Link></Button>
        </div>
      </form>
    </div>
  )
}
