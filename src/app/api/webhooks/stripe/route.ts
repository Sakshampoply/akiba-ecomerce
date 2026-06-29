import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { generateOrderNumber } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object
    const { items: itemsJson, couponCode, discountCents, shippingCents, taxCents } = intent.metadata

    // Idempotency — skip if order already exists
    const existing = await prisma.order.findUnique({ where: { stripePaymentId: intent.id } })
    if (existing) return NextResponse.json({ received: true })

    const items: Array<{ variantId: string; quantity: number }> = JSON.parse(itemsJson)

    // Fetch variants for snapshot data
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: items.map((i) => i.variantId) } },
      include: { product: { include: { images: { take: 1 } } } },
    })

    const subtotalCents = variants.reduce((sum, v) => {
      const item = items.find((i) => i.variantId === v.id)!
      return sum + v.price * item.quantity
    }, 0)

    // Resolve coupon
    let couponId: string | undefined
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (coupon) {
        couponId = coupon.id
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } })
      }
    }

    // Create order
    await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "PAID",
        subtotalCents,
        shippingCents: parseInt(shippingCents),
        discountCents: parseInt(discountCents),
        taxCents: parseInt(taxCents),
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
  }

  return NextResponse.json({ received: true })
}
