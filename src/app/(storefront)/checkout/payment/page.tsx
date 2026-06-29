"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/features/cart/store/cart.store"
import { formatPrice } from "@/lib/utils"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "")

const STEPS = ["Cart", "Shipping", "Payment", "Confirmation"]

function PaymentForm({ totalCents, onSuccess }: { totalCents: number; onSuccess: (orderId: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const clearCart = useCartStore((s) => s.clearCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError("")

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.")
      setLoading(false)
      return
    }

    if (paymentIntent?.status === "succeeded") {
      clearCart()
      onSuccess(paymentIntent.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-sm border border-[#2a2a3d] bg-[#1a1a27]">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <div className="p-3 rounded-sm bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full gap-2" disabled={loading || !stripe}>
        <Lock className="w-4 h-4" />
        {loading ? "Processing…" : `Pay ${formatPrice(totalCents)}`}
      </Button>
      <p className="text-[10px] text-[#555577] text-center">
        Secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}

export default function PaymentPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotalCents())
  const [clientSecret, setClientSecret] = useState("")
  const [totals, setTotals] = useState({ subtotalCents: 0, shippingCents: 0, taxCents: 0, discountCents: 0, totalCents: 0 })
  const [couponCode, setCouponCode] = useState("")
  const [couponInput, setCouponInput] = useState("")
  const [couponMsg, setCouponMsg] = useState("")
  const [loading, setLoading] = useState(true)

  async function fetchIntent(code?: string) {
    setLoading(true)
    const res = await fetch("/api/checkout/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })), couponCode: code }),
    })
    const data = await res.json()
    if (res.ok) {
      setClientSecret(data.clientSecret)
      setTotals(data)
    }
    setLoading(false)
    return { ok: res.ok, data }
  }

  useEffect(() => {
    if (items.length > 0 && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      fetchIntent()
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function applyCode() {
    const { ok, data } = await fetchIntent(couponInput)
    if (ok && data.coupon) {
      setCouponCode(couponInput)
      setCouponMsg(`✓ ${data.coupon.type === "PERCENTAGE" ? `${data.coupon.value}% off` : formatPrice(data.coupon.value) + " off"} applied`)
    } else {
      setCouponMsg(data.error ?? "Invalid coupon code")
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-[#8888aa] mb-4">Your cart is empty.</p>
        <Button asChild><Link href="/products">Shop Now</Link></Button>
      </div>
    )
  }

  const noStripeKey = !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 2 ? "bg-[#ff2d55] text-white" : i < 2 ? "bg-[#10b981] text-white" : "bg-[#2a2a3d] text-[#555577]"}`}>
              {i + 1}
            </div>
            <span className={`text-xs font-semibold tracking-wide uppercase ${i === 2 ? "text-[#f0f0ff]" : "text-[#555577]"}`}>{step}</span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-[#2a2a3d]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#ff2d55] mb-1">Step 2</p>
            <h1 className="text-2xl font-black text-[#f0f0ff]" style={{ fontFamily: "var(--font-syne)" }}>Payment</h1>
          </div>

          {/* Coupon */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#555577] mb-2">Coupon Code</p>
            <div className="flex gap-2">
              <Input placeholder="AKIBA10" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} className="h-9 text-xs" />
              <Button size="sm" variant="outline" onClick={applyCode} className="shrink-0">Apply</Button>
            </div>
            {couponMsg && <p className={`text-xs mt-1.5 ${couponMsg.startsWith("✓") ? "text-[#10b981]" : "text-[#ef4444]"}`}>{couponMsg}</p>}
          </div>

          {noStripeKey ? (
            <div className="p-6 rounded-sm border border-[#f59e0b]/20 bg-[#f59e0b]/5">
              <p className="text-sm text-[#f59e0b] font-semibold mb-2">Stripe not configured</p>
              <p className="text-xs text-[#8888aa]">Add <code className="text-[#f59e0b]">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and <code className="text-[#f59e0b]">STRIPE_SECRET_KEY</code> to your <code>.env.local</code> to enable payments.</p>
              <p className="text-xs text-[#555577] mt-2">Use test key: <code>pk_test_...</code> from your Stripe dashboard.</p>
            </div>
          ) : loading ? (
            <div className="h-48 rounded-sm border border-[#2a2a3d] bg-[#12121a] animate-pulse" />
          ) : clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: "night" } }}
            >
              <PaymentForm
                totalCents={totals.totalCents}
                onSuccess={(id) => router.push(`/checkout/confirmation?pi=${id}`)}
              />
            </Elements>
          ) : null}

          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/checkout/shipping"><ArrowLeft className="w-4 h-4" /> Back to Shipping</Link>
          </Button>
        </div>

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
            <div className="flex justify-between text-xs"><span className="text-[#8888aa]">Subtotal</span><span className="text-[#f0f0ff]">{formatPrice(totals.subtotalCents || subtotal)}</span></div>
            {totals.discountCents > 0 && <div className="flex justify-between text-xs"><span className="text-[#10b981]">Discount</span><span className="text-[#10b981]">-{formatPrice(totals.discountCents)}</span></div>}
            <div className="flex justify-between text-xs"><span className="text-[#8888aa]">Shipping</span><span className={totals.shippingCents === 0 ? "text-[#10b981]" : "text-[#f0f0ff]"}>{totals.shippingCents === 0 ? "Free" : formatPrice(totals.shippingCents)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#8888aa]">Tax (8%)</span><span className="text-[#f0f0ff]">{formatPrice(totals.taxCents)}</span></div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-[#2a2a3d] mt-2">
              <span className="text-[#f0f0ff]">Total</span>
              <span className="text-[#f0f0ff]">{formatPrice(totals.totalCents || subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
