import Link from "next/link"
import { Tag, Percent, DollarSign, Truck, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { CouponActions } from "./CouponActions"

export const dynamic = "force-dynamic"

const TYPE_ICON: Record<string, typeof Tag> = {
  PERCENTAGE: Percent,
  FIXED_AMOUNT: DollarSign,
  FREE_SHIPPING: Truck,
}

export default async function AdminPromotionsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })

  const active = coupons.filter((c) => c.isActive && (!c.expiresAt || c.expiresAt > new Date()))
  const expired = coupons.filter((c) => !c.isActive || (c.expiresAt && c.expiresAt <= new Date()))
  const totalRedemptions = coupons.reduce((s, c) => s + c.usageCount, 0)

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Discounts</p>
          <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>
            Promotions
          </h1>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/admin/promotions/new">
            <Plus className="w-4 h-4" /> New Coupon
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Coupons", value: active.length, color: "text-[#10b981]" },
          { label: "Total Coupons", value: coupons.length, color: "text-[#f0f0ff]" },
          { label: "Total Redemptions", value: totalRedemptions, color: "text-[#7c3aed]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-5">
            <p className="text-xs text-[#555577] font-semibold uppercase tracking-wider mb-2">{label}</p>
            <div className={`text-2xl font-black ${color}`} style={{ fontFamily: "var(--font-syne)" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Coupons table */}
      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3d]">
          <h2 className="text-sm font-black text-[#f0f0ff]">All Coupons</h2>
        </div>
        {coupons.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#555577]">No coupons yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a2a3d]">
                  {["Code", "Type", "Value", "Min Order", "Used / Limit", "Expires", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#555577] font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a27]">
                {coupons.map((c) => {
                  const Icon = TYPE_ICON[c.type] ?? Tag
                  const isExpired = c.expiresAt && c.expiresAt <= new Date()
                  const isExhausted = c.maxUsage !== null && c.usageCount >= c.maxUsage
                  const isActive = c.isActive && !isExpired && !isExhausted

                  return (
                    <tr key={c.id} className="hover:bg-[#1a1a27] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3 h-3 text-[#ff2d55]" />
                          <span className="font-mono font-bold text-[#f0f0ff]">{c.code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#8888aa]">{c.type.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 font-semibold text-[#f0f0ff]">
                        {c.type === "PERCENTAGE" ? `${c.value}%` : c.type === "FIXED_AMOUNT" ? formatPrice(c.value) : "Free"}
                      </td>
                      <td className="px-4 py-3 text-[#8888aa]">
                        {c.minOrderCents ? formatPrice(c.minOrderCents) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#f0f0ff] font-semibold">{c.usageCount}</span>
                        <span className="text-[#555577]"> / {c.maxUsage ?? "∞"}</span>
                      </td>
                      <td className="px-4 py-3 text-[#8888aa]">
                        {c.expiresAt
                          ? new Date(c.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        {isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : isExpired ? (
                          <Badge variant="error">Expired</Badge>
                        ) : isExhausted ? (
                          <Badge variant="outline">Exhausted</Badge>
                        ) : (
                          <Badge variant="dark">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <CouponActions couponId={c.id} isActive={c.isActive} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usage breakdown */}
      {coupons.length > 0 && (
        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6">
          <h2 className="text-sm font-black text-[#f0f0ff] mb-4">Redemption Breakdown</h2>
          <div className="space-y-3">
            {coupons.filter((c) => c.usageCount > 0).map((c) => {
              const max = Math.max(...coupons.map((x) => x.usageCount), 1)
              const pct = Math.round((c.usageCount / max) * 100)
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-[#f0f0ff]">{c.code}</span>
                    <span className="text-[#555577]">{c.usageCount} uses</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1a1a27]">
                    <div className="h-full rounded-full bg-[#ff2d55]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {coupons.every((c) => c.usageCount === 0) && (
              <p className="text-xs text-[#555577]">No redemptions yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
