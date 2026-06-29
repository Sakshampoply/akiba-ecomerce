"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

export function StockInput({ variantId, initialStock }: { variantId: string; initialStock: number }) {
  const router = useRouter()
  const [value, setValue] = useState(String(initialStock))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    const stock = parseInt(value)
    if (isNaN(stock) || stock < 0 || stock === initialStock) return
    setSaving(true)
    await fetch(`/api/inventory/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); router.refresh() }, 800)
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        onBlur={save}
        className="w-16 rounded-sm border border-[#2a2a3d] bg-[#0a0a0f] px-2 py-1 text-xs text-right focus:outline-none focus:border-[#ff2d55] transition-colors"
        style={{ color: saved ? "#10b981" : parseInt(value) === 0 ? "#ef4444" : parseInt(value) <= 5 ? "#f59e0b" : "#f0f0ff" }}
      />
      {saved && <Check className="w-3 h-3 text-[#10b981]" />}
    </div>
  )
}
