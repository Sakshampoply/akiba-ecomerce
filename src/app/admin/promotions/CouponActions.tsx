"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Trash2, Eye, EyeOff } from "lucide-react"

export function CouponActions({ couponId, isActive }: { couponId: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/coupons/${couponId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    router.refresh()
    setLoading(false)
  }

  async function deleteCoupon() {
    if (!confirm("Delete this coupon? If it has been used, it will be deactivated instead.")) return
    setLoading(true)
    await fetch(`/api/coupons/${couponId}`, { method: "DELETE" })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggle}
        disabled={loading}
        className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#f59e0b] hover:bg-[#2a2a3d] transition-all"
        title={isActive ? "Deactivate" : "Activate"}
      >
        {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={deleteCoupon}
        disabled={loading}
        className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#ef4444] hover:bg-[#2a2a3d] transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
