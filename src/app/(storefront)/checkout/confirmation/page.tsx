"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const pi = searchParams.get("pi")
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!pi)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!pi) return
    fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId: pi }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.orderNumber) setOrderNumber(data.orderNumber)
        else setError(data.error ?? "Could not confirm order.")
      })
      .catch(() => setError("Could not confirm order. Check your account for order status."))
      .finally(() => setLoading(false))
  }, [pi])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-[#10b981]/5 animate-ping" />
        </div>
        {loading ? (
          <Loader2 className="w-20 h-20 text-[#10b981] mx-auto relative animate-spin" />
        ) : (
          <CheckCircle2 className="w-20 h-20 text-[#10b981] mx-auto relative" />
        )}
      </div>

      <h1 className="text-3xl font-black text-[#f0f0ff] mb-3" style={{ fontFamily: "var(--font-syne)" }}>
        {loading ? "Confirming Order…" : "Order Confirmed!"}
      </h1>

      {loading ? (
        <p className="text-[#8888aa] mb-10">Locking in your order, please wait…</p>
      ) : error ? (
        <div>
          <p className="text-[#ef4444] text-sm mb-4">{error}</p>
          <p className="text-[#555577] text-xs mb-10">Your payment was successful. Check your account for order status.</p>
        </div>
      ) : (
        <>
          {orderNumber && (
            <p className="text-sm font-mono text-[#ff2d55] font-bold mb-2">{orderNumber}</p>
          )}
          <p className="text-[#8888aa] mb-2">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <p className="text-sm text-[#555577] mb-10">
            You can track your order status from your account page.
          </p>
        </>
      )}

      {!loading && (
        <>
          <div className="flex flex-col items-center gap-4 p-6 rounded-sm border border-[#10b981]/20 bg-[#10b981]/5 mb-10">
            <Package className="w-8 h-8 text-[#10b981]" />
            <div>
              <p className="text-sm font-semibold text-[#f0f0ff]">Your items are being prepared</p>
              <p className="text-xs text-[#555577] mt-1">Orders ship within 24 hours on business days</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/account/orders">
                View Orders <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-12 h-12 text-[#10b981] mx-auto animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
