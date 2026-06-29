"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function AddAddressForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ label: "Home", name: "", line1: "", line2: "", city: "", state: "", zip: "", country: "US", phone: "", isDefault: false })

  const f = (label: string, key: keyof typeof form, placeholder = "", type = "text") => (
    <div>
      <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1">{label}</label>
      <Input type={type} placeholder={placeholder} value={form[key] as string} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} />
    </div>
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.line1 || !form.city || !form.zip) { setError("Name, address, city, and zip are required."); return }
    setLoading(true); setError("")
    const res = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) { setForm({ label: "Home", name: "", line1: "", line2: "", city: "", state: "", zip: "", country: "US", phone: "", isDefault: false }); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? "Failed to save address") }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#555577] uppercase tracking-wider mb-1">Label</label>
          <select value={form.label} onChange={(e) => setForm((s) => ({ ...s, label: e.target.value }))}
            className="w-full rounded-sm border border-[#2a2a3d] bg-[#0a0a0f] px-3 py-2 text-sm text-[#f0f0ff] focus:outline-none focus:ring-1 focus:ring-[#ff2d55]">
            <option>Home</option><option>Work</option><option>Other</option>
          </select>
        </div>
        {f("Full Name *", "name", "Jane Doe")}
      </div>
      {f("Address Line 1 *", "line1", "123 Main St")}
      {f("Address Line 2", "line2", "Apt 4B")}
      <div className="grid grid-cols-3 gap-4">
        {f("City *", "city", "Tokyo")}
        {f("State / Province", "state", "CA")}
        {f("ZIP / Postal *", "zip", "90210")}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {f("Country", "country", "US")}
        {f("Phone", "phone", "+1 555 000 0000", "tel")}
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((s) => ({ ...s, isDefault: e.target.checked }))} className="w-4 h-4 accent-[#ff2d55]" />
        <span className="text-xs text-[#8888aa]">Set as default address</span>
      </label>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Address"}</Button>
    </form>
  )
}
