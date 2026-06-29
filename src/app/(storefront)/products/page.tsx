import Link from "next/link"
import { Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getProducts, getCategories } from "@/features/catalog/repositories/product.repository"
import { SortSelect } from "@/components/catalog/SortSelect"
import { ProductCard } from "@/components/catalog/ProductCard"

export const revalidate = 60

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; preorder?: string; q?: string; sort?: string }>
}) {
  const params = await searchParams
  const sort = (params.sort as "newest" | "price_asc" | "price_desc") || "newest"
  const [products, categories] = await Promise.all([
    getProducts({
      category: params.category,
      preorder: params.preorder === "true",
      q: params.q,
      sort,
    }),
    getCategories(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Catalog</p>
        <h1 className="text-3xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
          {params.category
            ? categories.find((c) => c.slug === params.category)?.name ?? "Products"
            : params.preorder === "true"
            ? "Pre-Orders"
            : "All Products"}
        </h1>
        <p className="text-sm text-[#555577] mt-1">{products.length} products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="sticky top-20 space-y-6">
            <form>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555577]" />
                <Input name="q" defaultValue={params.q} placeholder="Search products…" className="pl-9 h-9 text-xs" />
              </div>
            </form>

            <div>
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#555577] mb-3">Category</h3>
              <div className="flex flex-col gap-1">
                <Link href="/products" className={`text-left px-3 py-2 rounded-sm text-xs font-medium transition-all ${!params.category ? "bg-[#ff2d55]/10 text-[#ff2d55] border border-[#ff2d55]/20" : "text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27]"}`}>
                  All
                </Link>
                {categories.map((cat) => (
                  <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                    className={`text-left px-3 py-2 rounded-sm text-xs font-medium transition-all ${params.category === cat.slug ? "bg-[#ff2d55]/10 text-[#ff2d55] border border-[#ff2d55]/20" : "text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27]"}`}>
                    {cat.name}
                    <span className="ml-1 text-[#555577]">({cat._count.products})</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#555577] mb-3">Availability</h3>
              <div className="flex flex-col gap-1">
                <Link href="/products?preorder=true"
                  className={`text-left px-3 py-2 rounded-sm text-xs font-medium transition-all ${params.preorder === "true" ? "bg-[#7c3aed]/10 text-[#8b5cf6] border border-[#7c3aed]/20" : "text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27]"}`}>
                  Pre-Orders
                </Link>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full gap-2" asChild>
              <Link href="/products"><Filter className="w-3 h-3" /> Clear Filters</Link>
            </Button>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-[#555577]">Showing {products.length} results</p>
            <SortSelect current={sort} />
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <h2 className="text-lg font-black text-[#f0f0ff] mb-2">No products found</h2>
              <p className="text-sm text-[#555577] mb-4">Try a different filter or search term.</p>
              <Button variant="outline" asChild><Link href="/products">Clear filters</Link></Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
