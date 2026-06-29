import Link from "next/link"
import { CheckCircle2, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConfirmationPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-[#10b981]/5 animate-ping" />
        </div>
        <CheckCircle2 className="w-20 h-20 text-[#10b981] mx-auto relative" />
      </div>

      <h1 className="text-3xl font-black text-[#f0f0ff] mb-3" style={{ fontFamily: "var(--font-syne)" }}>
        Order Confirmed!
      </h1>
      <p className="text-[#8888aa] mb-2">
        Thank you for your purchase. Your order has been received and is being processed.
      </p>
      <p className="text-sm text-[#555577] mb-10">
        A confirmation email will be sent to your address shortly.
      </p>

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
    </div>
  )
}
