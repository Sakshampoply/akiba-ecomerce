import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Warehouse,
  Tag,
  BarChart2,
  Zap,
  Settings,
  ArrowLeft,
} from "lucide-react"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 border-r border-[#2a2a3d] bg-[#0a0a0f] flex flex-col z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-16 border-b border-[#2a2a3d]">
          <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-[#ff2d55]">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div>
            <span
              className="text-sm font-bold tracking-tight block leading-none"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              AKIBA<span className="text-[#ff2d55]">.</span>
            </span>
            <span className="text-[10px] text-[#555577] uppercase tracking-widest">Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold tracking-wide text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all group"
            >
              <Icon className="w-4 h-4 group-hover:text-[#ff2d55] transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[#2a2a3d] space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a27] transition-all"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold text-[#555577] hover:text-[#8888aa] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-56 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-[#2a2a3d] bg-[#0a0a0f]/90 backdrop-blur-xl flex items-center justify-between px-6">
          <div />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#ff2d55]/10 border border-[#ff2d55]/20 flex items-center justify-center text-xs font-bold text-[#ff2d55]">
                A
              </div>
              <div>
                <div className="text-xs font-semibold text-[#f0f0ff]">Admin</div>
                <div className="text-[10px] text-[#555577]">admin@akiba.shop</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  )
}
