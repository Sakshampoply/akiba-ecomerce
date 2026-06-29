"use client"

import Link from "next/link"
import { ShoppingCart, User, Menu, X, Zap, LogOut, LayoutDashboard } from "lucide-react"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { CartBadge } from "./CartBadge"
import { SearchBar } from "./SearchBar"

const NAV_LINKS = [
  { href: "/products", label: "All Products" },
  { href: "/products?category=figures", label: "Figures" },
  { href: "/products?category=apparel", label: "Apparel" },
  { href: "/products?category=accessories", label: "Accessories" },
  { href: "/products?preorder=true", label: "Pre-Orders" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a3d] bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-sm bg-[#ff2d55] group-hover:bg-[#ff4d6d] transition-colors">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
              AKIBA<span className="text-[#ff2d55]">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-xs font-semibold tracking-widest uppercase text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] rounded-sm transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <SearchBar />

            {/* User menu */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-sm text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all"
              >
                {session?.user ? (
                  <div className="w-6 h-6 rounded-full bg-[#ff2d55]/20 border border-[#ff2d55]/40 flex items-center justify-center text-[10px] font-bold text-[#ff2d55]">
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                ) : (
                  <User className="w-4 h-4" />
                )}
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-20 w-48 rounded-sm border border-[#2a2a3d] bg-[#12121a] shadow-xl overflow-hidden">
                    {session?.user ? (
                      <>
                        <div className="px-4 py-3 border-b border-[#2a2a3d]">
                          <p className="text-xs font-semibold text-[#f0f0ff] truncate">{session.user.name}</p>
                          <p className="text-[10px] text-[#555577] truncate">{session.user.email}</p>
                        </div>
                        <Link href="/account" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all">
                          <User className="w-3.5 h-3.5" /> My Account
                        </Link>
                        <Link href="/account/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all">
                          <ShoppingCart className="w-3.5 h-3.5" /> Orders
                        </Link>
                        {session.user.role === "ADMIN" && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#ff2d55] hover:bg-[#1a1a27] transition-all border-t border-[#2a2a3d]">
                            <LayoutDashboard className="w-3.5 h-3.5" /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false) }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#8888aa] hover:text-[#ef4444] hover:bg-[#1a1a27] transition-all border-t border-[#2a2a3d]"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all">
                          Sign In
                        </Link>
                        <Link href="/register" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#ff2d55] hover:bg-[#1a1a27] transition-all">
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <Link
              href="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-sm text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <CartBadge />
            </Link>

            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-sm text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className={cn("lg:hidden overflow-hidden transition-all duration-300", mobileOpen ? "max-h-96 pb-4" : "max-h-0")}>
          <nav className="flex flex-col gap-1 pt-2 border-t border-[#2a2a3d]">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-semibold tracking-wider uppercase text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] rounded-sm transition-all">
                {link.label}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link href="/account" onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold tracking-wider uppercase text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] rounded-sm transition-all">
                  Account
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left px-3 py-2.5 text-sm font-semibold tracking-wider uppercase text-[#8888aa] hover:text-[#ef4444] hover:bg-[#1a1a27] rounded-sm transition-all">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-semibold tracking-wider uppercase text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] rounded-sm transition-all">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
