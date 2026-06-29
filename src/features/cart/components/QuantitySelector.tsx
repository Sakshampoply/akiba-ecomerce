"use client"

import { Minus, Plus } from "lucide-react"
import { useState } from "react"

export function QuantitySelector({ max = 99 }: { max?: number }) {
  const [qty, setQty] = useState(1)
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-[#2a2a3d] rounded-sm">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex items-center justify-center w-9 h-9 text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all rounded-l-sm"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-10 text-center text-sm font-semibold text-[#f0f0ff]">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(max, q + 1))}
          className="flex items-center justify-center w-9 h-9 text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all rounded-r-sm"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <span className="text-xs text-[#555577]">{max} available</span>
    </div>
  )
}
