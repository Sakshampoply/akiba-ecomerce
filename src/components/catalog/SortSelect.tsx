"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"

export function SortSelect({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function handleChange(sort: string) {
    const next = new URLSearchParams(params.toString())
    if (sort === "newest") next.delete("sort")
    else next.set("sort", sort)
    router.push(`${pathname}?${next}`)
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="text-xs bg-[#12121a] border border-[#2a2a3d] text-[#8888aa] rounded-sm px-3 py-1.5 focus:outline-none focus:border-[#ff2d55]"
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  )
}
