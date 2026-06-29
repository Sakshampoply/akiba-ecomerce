import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getProducts } from "@/features/catalog/repositories/product.repository"
import { ProductCard } from "@/components/catalog/ProductCard"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = "" } = await searchParams
  const products = await getProducts({ q, limit: 24 })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Search</p>
        <h1 className="text-3xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
          {q ? `"${q}"` : "All Products"}
        </h1>
        <p className="text-sm text-[#555577] mt-1">
          {products.length} {products.length === 1 ? "result" : "results"} found
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-lg font-black text-[#f0f0ff] mb-2">No results for "{q}"</h2>
          <p className="text-sm text-[#555577] mb-6">Try a different keyword or browse all products.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wider uppercase bg-[#ff2d55] text-white rounded-sm hover:bg-[#e02249] transition-colors">
            Browse All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  )
}
