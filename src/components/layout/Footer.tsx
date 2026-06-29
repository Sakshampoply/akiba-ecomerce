import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[#2a2a3d] bg-[#0a0a0f] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-[#ff2d55]">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span
                className="text-base font-bold tracking-tight"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                AKIBA<span className="text-[#ff2d55]">.</span>
              </span>
            </Link>
            <p className="text-xs text-[#555577] leading-relaxed max-w-[200px]">
              The definitive destination for premium anime figures, apparel, and collectibles.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#f0f0ff] mb-4">
              Shop
            </h4>
            <ul className="space-y-2">
              {["All Products", "Figures", "Apparel", "Accessories", "Pre-Orders", "Sale"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="/products"
                      className="text-xs text-[#555577] hover:text-[#8888aa] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#f0f0ff] mb-4">
              Account
            </h4>
            <ul className="space-y-2">
              {["Login", "Register", "Orders", "Addresses", "Wishlist"].map((item) => (
                <li key={item}>
                  <Link
                    href="/account"
                    className="text-xs text-[#555577] hover:text-[#8888aa] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#f0f0ff] mb-4">
              Info
            </h4>
            <ul className="space-y-2">
              {["About", "Shipping Policy", "Returns", "FAQ", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-xs text-[#555577] hover:text-[#8888aa] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#1a1a27]">
          <p className="text-xs text-[#555577]">
            © 2024 Akiba Shop. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-[#555577] hover:text-[#8888aa] transition-colors">GitHub</a>
            <a href="#" className="text-xs text-[#555577] hover:text-[#8888aa] transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
