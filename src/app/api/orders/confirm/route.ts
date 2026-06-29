import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateOrderNumber } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const { paymentIntentId } = await req.json()
  if (!paymentIntentId) {
    return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 })
  }

  // Verify payment with Stripe server-side
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (intent.status !== "succeeded") {
    return NextResponse.json({ error: "Payment not successful" }, { status: 400 })
  }

  // Idempotent — return existing order if already created (e.g. by webhook)
  const existing = await prisma.order.findUnique({
    where: { stripePaymentId: intent.id },
    select: { orderNumber: true, id: true },
  })
  if (existing) return NextResponse.json(existing)

  const session = await auth()
  const { items: itemsJson, couponCode, discountCents, shippingCents, taxCents } = intent.metadata as Record<string, string>

  const items: Array<{ variantId: string; quantity: number }> = JSON.parse(itemsJson)

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
    include: { product: { include: { images: { take: 1 } } } },
  })

  const subtotalCents = variants.reduce((sum, v) => {
    const item = items.find((i) => i.variantId === v.id)!
    return sum + v.price * item.quantity
  }, 0)

  let couponId: string | undefined
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
    if (coupon) {
      couponId = coupon.id
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } })
    }
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: "PAID",
      userId: session?.user?.id,
      subtotalCents,
      shippingCents: parseInt(shippingCents ?? "0"),
      discountCents: parseInt(discountCents ?? "0"),
      taxCents: parseInt(taxCents ?? "0"),
      totalCents: intent.amount,
      stripePaymentId: intent.id,
      couponId,
      items: {
        create: items.map((item) => {
          const v = variants.find((vr) => vr.id === item.variantId)!
          return {
            productId: v.productId,
            variantId: v.id,
            productName: v.product.name,
            variantLabel: [v.size, v.color].filter(Boolean).join(" / ") || "Standard",
            imageUrl: v.product.images[0]?.url ?? null,
            quantity: item.quantity,
            unitPriceCents: v.price,
            totalCents: v.price * item.quantity,
          }
        }),
      },
    },
    select: { orderNumber: true, id: true },
  })

  // Decrement stock (skip pre-orders)
  for (const item of items) {
    const v = variants.find((vr) => vr.id === item.variantId)!
    if (!v.product.isPreOrder) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    }
  }

  return NextResponse.json(order)
}
