import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, Truck, Shield, ArrowLeft, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { getProductBySlug, getProducts } from "@/features/catalog/repositories/product.repository"
import { AddToCartButton } from "@/features/cart/components/AddToCartButton"
import { QuantitySelector } from "@/features/cart/components/QuantitySelector"

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

export const revalidate = 60

export async function generateStaticParams() {
  const products = await getProducts({ limit: 100 })
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return { title: product.name, description: product.description.slice(0, 160) }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0]
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0)
  const emoji = EMOJI_MAP[product.slug] ?? "📦"

  // Related products
  const related = await getProducts({ limit: 3 })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#555577] mb-8">
        <Link href="/" className="hover:text-[#8888aa] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#8888aa] transition-colors">Products</Link>
        <span>/</span>
        <span className="text-[#8888aa] truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-sm bg-gradient-to-br from-[#1a1a27] to-[#0a0a0f] flex items-center justify-center overflow-hidden border border-[#2a2a3d]">
            <span className="text-[10rem]">{emoji}</span>
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isPreOrder && <Badge variant="secondary">Pre-Order</Badge>}
              {defaultVariant?.compareAt && <Badge variant="error">Sale</Badge>}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`aspect-square rounded-sm border ${i === 1 ? "border-[#ff2d55]" : "border-[#2a2a3d] hover:border-[#3d3d5c]"} bg-gradient-to-br from-[#1a1a27] to-[#0a0a0f] flex items-center justify-center cursor-pointer transition-all`}
              >
                <span className="text-2xl">{emoji}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#555577] mb-1">{product.brand}</div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#f0f0ff] leading-tight mb-4" style={{ fontFamily: "var(--font-syne)" }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`w-4 h-4 ${i <= 4 ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#2a2a3d]"}`} />
              ))}
            </div>
            <span className="text-sm font-semibold text-[#f0f0ff]">4.8</span>
            <span className="text-sm text-[#555577]">Verified product</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
              {defaultVariant ? formatPrice(defaultVariant.price) : "—"}
            </span>
            {defaultVariant?.compareAt && (
              <>
                <span className="text-lg text-[#555577] line-through">{formatPrice(defaultVariant.compareAt)}</span>
                <Badge variant="error">Save {formatPrice(defaultVariant.compareAt - defaultVariant.price)}</Badge>
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mb-6">
              <p className="text-xs font-bold tracking-widest uppercase text-[#555577] mb-3">
                {product.variants[0].size ? "Size" : "Edition"}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <div
                    key={v.id}
                    className={`px-3 py-2 rounded-sm border text-xs font-semibold cursor-pointer transition-all ${
                      v.isDefault
                        ? "border-[#ff2d55] bg-[#ff2d55]/5 text-[#ff2d55]"
                        : "border-[#2a2a3d] text-[#8888aa] hover:border-[#3d3d5c]"
                    } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {v.size ?? v.sku.split("-").pop()}
                    {v.stock === 0 && " (OOS)"}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#555577] mb-3">Quantity</p>
            <QuantitySelector max={totalStock} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <AddToCartButton
              productId={product.id}
              variantId={defaultVariant?.id ?? ""}
              productName={product.name}
              price={defaultVariant?.price ?? 0}
              emoji={emoji}
              disabled={totalStock === 0 && !product.isPreOrder}
            />
            <Button size="lg" variant="outline" className="w-12 p-0">
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-2 gap-3 mb-8 p-4 rounded-sm bg-[#12121a] border border-[#2a2a3d]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#10b981]" />
              <div>
                <div className="text-xs font-semibold text-[#f0f0ff]">Free Shipping</div>
                <div className="text-[10px] text-[#555577]">Orders over $75</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#10b981]" />
              <div>
                <div className="text-xs font-semibold text-[#f0f0ff]">100% Authentic</div>
                <div className="text-[10px] text-[#555577]">Official merchandise</div>
              </div>
            </div>
          </div>

          {/* Stock info */}
          {totalStock > 0 && totalStock <= 10 && !product.isPreOrder && (
            <div className="p-3 rounded-sm bg-[#f59e0b]/10 border border-[#f59e0b]/20 mb-4">
              <p className="text-xs text-[#f59e0b] font-semibold">⚡ Only {totalStock} left in stock — order soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-[#2a2a3d] pt-12 mb-16">
        <h2 className="text-xl font-black text-[#f0f0ff] mb-4" style={{ fontFamily: "var(--font-syne)" }}>
          About this product
        </h2>
        <p className="text-sm text-[#8888aa] leading-relaxed max-w-3xl">{product.description}</p>
      </div>

      {/* Related */}
      <div className="border-t border-[#2a2a3d] pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
            You may also like
          </h2>
          <Link href="/products" className="flex items-center gap-1 text-sm text-[#8888aa] hover:text-[#ff2d55] transition-colors">
            <ArrowLeft className="w-4 h-4 rotate-180" />
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {related.filter((p) => p.slug !== slug).slice(0, 3).map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="group flex flex-col rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden hover:border-[#3d3d5c] transition-all hover:-translate-y-1"
            >
              <div className="aspect-square bg-gradient-to-br from-[#1a1a27] to-[#0a0a0f] flex items-center justify-center">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-500">
                  {EMOJI_MAP[p.slug] ?? "📦"}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[#f0f0ff] mb-1 line-clamp-2">{p.name}</h3>
                <span className="text-sm font-black text-[#f0f0ff]">
                  {p.variants[0] ? formatPrice(p.variants[0].price) : "—"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
