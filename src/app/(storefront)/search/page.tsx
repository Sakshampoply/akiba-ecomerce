import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { getProducts } from "@/features/catalog/repositories/product.repository"

const EMOJI_MAP: Record<string, string> = {
  "tanjiro-kamado-1-7-scale": "⚔️",
  "gojo-satoru-nendoroid": "🔵",
  "survey-corps-hoodie": "🎌",
  "pochita-plush-premium": "🪚",
  "naruto-sage-mode-1-4-scale": "🍃",
  "deku-full-cowling-figure": "💪",
  "breath-of-sun-tee": "🌅",
  "luffy-gear5-pop-figure": "🏴‍☠️",
  "anya-forger-nendoroid": "😏",
  "akiba-tote-bag-logo": "👜",
}

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
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wider uppercase bg-[#ff2d55] text-white rounded-sm hover:bg-[#e02249] transition-colors"
          >
            Browse All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const variant = product.variants[0]
            const totalStock = product.variants.reduce((s, v) => s + v.stock, 0)
            const emoji = EMOJI_MAP[product.slug] ?? "📦"

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group relative flex flex-col rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden hover:border-[#3d3d5c] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
              >
                <div className="relative aspect-square bg-gradient-to-br from-[#1a1a27] to-[#0a0a0f] flex items-center justify-center overflow-hidden">
                  <span className="text-6xl transition-transform duration-500 group-hover:scale-110">{emoji}</span>
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.isPreOrder && <Badge variant="secondary">Pre-Order</Badge>}
                    {variant?.compareAt && <Badge variant="error">Sale</Badge>}
                  </div>
                  {totalStock === 0 && !product.isPreOrder && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-xs font-bold tracking-widest uppercase text-[#555577]">Sold Out</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-4">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-[#555577] mb-1">{product.brand}</div>
                  <h3 className="text-sm font-semibold text-[#f0f0ff] mb-2 leading-snug line-clamp-2 flex-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                    <span className="text-xs font-semibold text-[#f0f0ff]">4.8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-[#f0f0ff]">
                        {variant ? formatPrice(variant.price) : "—"}
                      </span>
                      {variant?.compareAt && (
                        <span className="text-xs text-[#555577] line-through">{formatPrice(variant.compareAt)}</span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#555577] group-hover:text-[#ff2d55] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
