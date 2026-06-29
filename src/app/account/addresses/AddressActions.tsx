"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Trash2 } from "lucide-react"

export function AddressActions({ addressId }: { addressId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function deleteAddress() {
    if (!confirm("Remove this address?")) return
    setLoading(true)
    await fetch(`/api/addresses/${addressId}`, { method: "DELETE" })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={deleteAddress}
      disabled={loading}
      className="flex items-center justify-center w-7 h-7 rounded-sm text-[#555577] hover:text-[#ef4444] hover:bg-[#2a2a3d] transition-all"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
