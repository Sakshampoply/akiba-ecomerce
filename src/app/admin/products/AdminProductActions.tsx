"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function AdminProductActions({ productId, isActive }: { productId: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleActive() {
    setLoading(true)
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    router.refresh()
    setLoading(false)
  }

  async function deleteProduct() {
    if (!confirm("Deactivate this product? It will be hidden from the storefront.")) return
    setLoading(true)
    await fetch(`/api/products/${productId}`, { method: "DELETE" })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#f0f0ff] hover:bg-[#2a2a3d] transition-all"
      >
        <Edit className="w-3.5 h-3.5" />
      </Link>
      <button
        onClick={toggleActive}
        disabled={loading}
        className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#f59e0b] hover:bg-[#2a2a3d] transition-all"
        title={isActive ? "Deactivate" : "Activate"}
      >
        {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={deleteProduct}
        disabled={loading}
        className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#ef4444] hover:bg-[#2a2a3d] transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
