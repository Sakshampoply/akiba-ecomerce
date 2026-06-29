"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

const ORDER_STATUSES = ["PENDING", "PAYMENT_PROCESSING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value
    if (status === currentStatus) return
    setLoading(true)
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={loading}
      className="bg-[#1a1a27] border border-[#2a2a3d] text-[#f0f0ff] text-xs rounded-sm px-2 py-1.5 focus:outline-none focus:border-[#ff2d55] disabled:opacity-50 transition-colors"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
      ))}
    </select>
  )
}
