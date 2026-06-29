"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleClose() {
    setOpen(false)
    setQuery("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    handleClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") handleClose()
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-1">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products…"
          className="w-40 sm:w-56 h-9 px-3 text-sm bg-[#1a1a27] border border-[#ff2d55]/40 rounded-sm text-[#f0f0ff] placeholder:text-[#555577] focus:outline-none focus:border-[#ff2d55] transition-all"
        />
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center justify-center w-9 h-9 rounded-sm text-[#555577] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </form>
    )
  }

  return (
    <button
      onClick={handleOpen}
      className="flex items-center justify-center w-9 h-9 rounded-sm text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all"
    >
      <Search className="w-4 h-4" />
    </button>
  )
}
