import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

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

type Props = {
  product: {
    id: string
    slug: string
    name: string
    brand: string | null
    isPreOrder: boolean
    variants: { price: number; compareAt: number | null }[]
    images: { url: string; altText: string | null }[]
  }
}

export function ProductCard({ product }: Props) {
  const variant = product.variants[0]
  const totalStock = (product as { variants: { stock?: number }[] }).variants.reduce((s, v) => s + (v.stock ?? 0), 0)
  const image = product.images[0]
  const emoji = EMOJI_MAP[product.slug] ?? "📦"

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden hover:border-[#3d3d5c] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
    >
      <div className="relative aspect-square bg-gradient-to-br from-[#1a1a27] to-[#0a0a0f] flex items-center justify-center overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-6xl transition-transform duration-500 group-hover:scale-110">{emoji}</span>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isPreOrder && <Badge variant="secondary">Pre-Order</Badge>}
          {variant?.compareAt && <Badge variant="error">Sale</Badge>}
        </div>
        {totalStock > 0 && totalStock <= 10 && !product.isPreOrder && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="gold">Only {totalStock} left</Badge>
          </div>
        )}
        {totalStock === 0 && !product.isPreOrder && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs font-bold tracking-widest uppercase text-[#555577]">Sold Out</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="text-[10px] font-bold tracking-widest uppercase text-[#555577] mb-1">{product.brand}</div>
        <h3 className="text-sm font-semibold text-[#f0f0ff] mb-2 leading-snug line-clamp-2 flex-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
          <span className="text-xs font-semibold text-[#f0f0ff]">4.8</span>
          <span className="text-xs text-[#555577]">(—)</span>
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
}
