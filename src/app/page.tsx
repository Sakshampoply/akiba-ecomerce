import Link from "next/link"
import { ArrowRight, Star, Zap, Shield, Truck, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Demon Slayer — Tanjiro Kamado 1/7 Scale",
    price: 18900,
    compareAt: 22000,
    category: "Figures",
    brand: "Good Smile Company",
    isNew: true,
    rating: 4.9,
    reviews: 248,
    gradient: "from-[#1a0a1a] to-[#2d1a2d]",
    accent: "#ff2d55",
    emoji: "⚔️",
  },
  {
    id: "2",
    name: "Jujutsu Kaisen — Gojo Satoru Nendoroid",
    price: 8500,
    compareAt: null,
    category: "Figures",
    brand: "Good Smile Company",
    isNew: false,
    rating: 4.8,
    reviews: 512,
    gradient: "from-[#0a0a1a] to-[#1a1a2d]",
    accent: "#7c3aed",
    emoji: "🔵",
  },
  {
    id: "3",
    name: "Attack on Titan — Survey Corps Hoodie",
    price: 6800,
    compareAt: null,
    category: "Apparel",
    brand: "Akiba Originals",
    isNew: true,
    rating: 4.7,
    reviews: 183,
    gradient: "from-[#0a1a0a] to-[#1a2d1a]",
    accent: "#10b981",
    emoji: "🎌",
  },
  {
    id: "4",
    name: "Chainsaw Man — Pochita Plush Premium",
    price: 4200,
    compareAt: 5500,
    category: "Accessories",
    brand: "Bandai",
    isNew: false,
    rating: 4.9,
    reviews: 876,
    gradient: "from-[#1a0a0a] to-[#2d1a0a]",
    accent: "#f59e0b",
    emoji: "🪚",
  },
]

const CATEGORIES = [
  { name: "Figures", count: 248, emoji: "🗿", href: "/products?category=figures" },
  { name: "Apparel", count: 124, emoji: "👕", href: "/products?category=apparel" },
  { name: "Accessories", count: 89, emoji: "📦", href: "/products?category=accessories" },
  { name: "Pre-Orders", count: 32, emoji: "⏳", href: "/products?preorder=true" },
]

const FEATURES = [
  { icon: Truck, label: "Free Shipping", desc: "On orders over $75" },
  { icon: Shield, label: "Authentic", desc: "100% official merchandise" },
  { icon: RotateCcw, label: "Easy Returns", desc: "30-day hassle-free" },
  { icon: Zap, label: "Fast Dispatch", desc: "Ships within 24 hours" },
]

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,45,85,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(124,58,237,0.08),transparent)]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="default" className="gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d55] animate-pulse" />
                New Arrivals
              </Badge>
              <Badge variant="secondary">Summer 2024 Collection</Badge>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              <span className="block text-[#f0f0ff]">PREMIUM</span>
              <span className="block gradient-text">ANIME MERCH</span>
              <span className="block text-[#f0f0ff]">DELIVERED.</span>
            </h1>

            <p className="text-[#8888aa] text-lg leading-relaxed mb-10 max-w-xl">
              From scale figures to exclusive apparel — curated for collectors who demand the best.
              Official. Authentic. Obsession-grade.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="xl" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/products?preorder=true">View Pre-Orders</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 pt-10 border-t border-[#2a2a3d]">
              <div>
                <div className="text-2xl font-black text-[#f0f0ff]">50K+</div>
                <div className="text-xs text-[#555577] uppercase tracking-widest">Collectors</div>
              </div>
              <div className="w-px h-8 bg-[#2a2a3d]" />
              <div>
                <div className="text-2xl font-black text-[#f0f0ff]">2,400+</div>
                <div className="text-xs text-[#555577] uppercase tracking-widest">Products</div>
              </div>
              <div className="w-px h-8 bg-[#2a2a3d]" />
              <div>
                <div className="text-2xl font-black text-[#f0f0ff]">4.9★</div>
                <div className="text-xs text-[#555577] uppercase tracking-widest">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative right side */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden xl:flex items-center justify-center">
          <div className="relative w-72 h-72">
            <div className="absolute inset-0 rounded-full bg-[#ff2d55]/5 animate-pulse" />
            <div className="absolute inset-8 rounded-full bg-[#7c3aed]/5 animate-pulse [animation-delay:1s]" />
            <div className="absolute inset-16 rounded-full bg-[#ff2d55]/10 animate-pulse [animation-delay:0.5s]" />
            <div className="absolute inset-0 flex items-center justify-center text-8xl">⚔️</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ─────────────────────────────────── */}
      <section className="border-y border-[#2a2a3d] bg-[#12121a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#2a2a3d]">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-4">
                <Icon className="w-5 h-5 text-[#ff2d55] shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#f0f0ff]">{label}</div>
                  <div className="text-xs text-[#555577]">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-2">
              Browse
            </p>
            <h2
              className="text-3xl font-black text-[#f0f0ff]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Shop by Category
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-sm text-[#8888aa] hover:text-[#ff2d55] transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative overflow-hidden rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6 hover:border-[#ff2d55]/50 hover:bg-[#1a1a27] transition-all duration-300"
            >
              <div className="text-4xl mb-4">{cat.emoji}</div>
              <div
                className="text-lg font-black text-[#f0f0ff] mb-1"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {cat.name}
              </div>
              <div className="text-xs text-[#555577]">{cat.count} products</div>
              <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-[#555577] group-hover:text-[#ff2d55] group-hover:translate-x-1 transition-all" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,45,85,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-2">
              Featured
            </p>
            <h2
              className="text-3xl font-black text-[#f0f0ff]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Fan Favorites
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-sm text-[#8888aa] hover:text-[#ff2d55] transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative flex flex-col rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden hover:border-[#3d3d5c] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
            >
              {/* Image area */}
              <div
                className={`relative aspect-square bg-gradient-to-br ${product.gradient} flex items-center justify-center overflow-hidden`}
              >
                <span className="text-7xl transition-transform duration-500 group-hover:scale-110">
                  {product.emoji}
                </span>
                {product.isNew && (
                  <Badge variant="default" className="absolute top-3 left-3">
                    New
                  </Badge>
                )}
                {product.compareAt && (
                  <Badge variant="error" className="absolute top-3 right-3">
                    Sale
                  </Badge>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 p-4">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#555577] mb-1">
                  {product.brand}
                </div>
                <h3 className="text-sm font-semibold text-[#f0f0ff] mb-1 leading-tight line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                  <span className="text-xs font-semibold text-[#f0f0ff]">{product.rating}</span>
                  <span className="text-xs text-[#555577]">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-[#f0f0ff]">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAt && (
                      <span className="text-xs text-[#555577] line-through">
                        {formatPrice(product.compareAt)}
                      </span>
                    )}
                  </div>
                  <Badge variant="dark" className="text-[10px]">
                    {product.category}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section className="mx-4 sm:mx-6 mb-16 rounded-sm overflow-hidden relative">
        <div className="bg-[#12121a] border border-[#2a2a3d]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,45,85,0.08),transparent_70%)]" />
          <div className="relative max-w-7xl mx-auto px-8 sm:px-12 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-2">
                Exclusive
              </p>
              <h2
                className="text-2xl sm:text-3xl font-black text-[#f0f0ff] leading-tight"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                Join the collector&apos;s club.
                <br />
                <span className="gradient-text">10% off your first order.</span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button size="lg" asChild>
                <Link href="/register">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
