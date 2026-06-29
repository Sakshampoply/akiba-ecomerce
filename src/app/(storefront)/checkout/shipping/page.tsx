"use client"

import Link from "next/link"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/features/cart/store/cart.store"
import { formatPrice } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"

const STEPS = ["Cart", "Shipping", "Payment", "Confirmation"]

export default function ShippingPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotalCents())
  const shipping = subtotal >= 7500 ? 0 : 799
  const [form, setForm] = useState({ name: "", line1: "", line2: "", city: "", state: "", zip: "", country: "US", phone: "" })

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    // Store shipping in sessionStorage for payment step
    sessionStorage.setItem("shipping", JSON.stringify(form))
    router.push("/checkout/payment")
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-[#8888aa] mb-4">Your cart is empty.</p>
        <Button asChild><Link href="/products">Shop Now</Link></Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all ${i === 1 ? "bg-[#ff2d55] text-white" : i < 1 ? "bg-[#10b981] text-white" : "bg-[#2a2a3d] text-[#555577]"}`}>
              {i + 1}
            </div>
            <span className={`text-xs font-semibold tracking-wide uppercase ${i === 1 ? "text-[#f0f0ff]" : "text-[#555577]"}`}>{step}</span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-[#2a2a3d]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleContinue} className="lg:col-span-2 space-y-5">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Step 1</p>
            <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Shipping Address</h1>
          </div>

          <div>
            <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">Full Name</label>
            <Input placeholder="Jane Doe" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>

          <div>
            <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">Address Line 1</label>
            <Input placeholder="123 Main Street" value={form.line1} onChange={(e) => set("line1", e.target.value)} required />
          </div>

          <div>
            <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">Address Line 2 <span className="text-[#555577] normal-case tracking-normal">(optional)</span></label>
            <Input placeholder="Apt, Suite, Unit…" value={form.line2} onChange={(e) => set("line2", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">City</label>
              <Input placeholder="New York" value={form.city} onChange={(e) => set("city", e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">State</label>
              <Input placeholder="NY" value={form.state} onChange={(e) => set("state", e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">ZIP Code</label>
              <Input placeholder="10001" value={form.zip} onChange={(e) => set("zip", e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">Phone <span className="text-[#555577] normal-case tracking-normal">(optional)</span></label>
              <Input placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" size="lg" className="gap-2" asChild>
              <Link href="/cart"><ArrowLeft className="w-4 h-4" /> Back to Cart</Link>
            </Button>
            <Button type="submit" size="lg" className="flex-1 gap-2">
              Continue to Payment <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Summary */}
        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-5 h-fit sticky top-20">
          <h2 className="text-sm font-black text-[#f0f0ff] mb-4" style={{ fontFamily: "var(--font-syne)" }}>Order Summary</h2>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-xs">
                <span className="text-[#8888aa] truncate flex-1">{item.productName} × {item.quantity}</span>
                <span className="text-[#f0f0ff] font-semibold ml-2 shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#2a2a3d] pt-3 space-y-1.5">
            <div className="flex justify-between text-xs"><span className="text-[#8888aa]">Subtotal</span><span className="text-[#f0f0ff]">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#8888aa]">Shipping</span><span className={shipping === 0 ? "text-[#10b981]" : "text-[#f0f0ff]"}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-[#2a2a3d] mt-2">
              <span className="text-[#f0f0ff]">Est. Total</span>
              <span className="text-[#f0f0ff]">{formatPrice(subtotal + shipping)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
