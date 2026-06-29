import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AddressActions } from "./AddressActions"
import { AddAddressForm } from "./AddAddressForm"

export default async function AccountAddressesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/account/addresses")

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }],
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-[#555577] hover:text-[#f0f0ff] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">My Account</p>
          <h1 className="text-3xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Saved Addresses</h1>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-sm border border-[#2a2a3d] bg-[#12121a] mb-6">
          <MapPin className="w-10 h-10 text-[#2a2a3d] mb-3" />
          <p className="text-sm font-semibold text-[#f0f0ff] mb-1">No saved addresses</p>
          <p className="text-xs text-[#555577]">Add an address below to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#f0f0ff] uppercase tracking-wider">{addr.label}</span>
                  {addr.isDefault && <Badge variant="gold">Default</Badge>}
                </div>
                <AddressActions addressId={addr.id} />
              </div>
              <p className="text-sm font-semibold text-[#f0f0ff]">{addr.name}</p>
              <p className="text-xs text-[#8888aa] mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
              <p className="text-xs text-[#8888aa]">{addr.city}, {addr.state} {addr.zip}</p>
              <p className="text-xs text-[#8888aa]">{addr.country}</p>
              {addr.phone && <p className="text-xs text-[#555577] mt-1">{addr.phone}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-6">
        <h2 className="text-sm font-black text-[#f0f0ff] mb-4">Add New Address</h2>
        <AddAddressForm />
      </div>
    </div>
  )
}
