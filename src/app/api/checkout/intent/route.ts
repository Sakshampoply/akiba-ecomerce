import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  items: z.array(
    z.object({ variantId: z.string(), quantity: z.number().int().positive() })
  ),
  couponCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, couponCode } = schema.parse(body)

    // Fetch variants from DB to get authoritative prices (never trust client)
    const variantIds = items.map((i) => i.variantId)
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    })

    let subtotalCents = 0
    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId)
      if (!variant) return NextResponse.json({ error: "Invalid item" }, { status: 400 })
      if (variant.stock < item.quantity && !variant.product.isPreOrder) {
        return NextResponse.json({ error: `${variant.product.name} is out of stock` }, { status: 409 })
      }
      subtotalCents += variant.price * item.quantity
    }

    // Apply coupon if provided
    let discountCents = 0
    let coupon = null
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase(), isActive: true } })
      if (coupon) {
        if (coupon.minOrderCents && subtotalCents < coupon.minOrderCents) {
          return NextResponse.json({ error: `Minimum order of $${(coupon.minOrderCents / 100).toFixed(2)} required` }, { status: 400 })
        }
        if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
          return NextResponse.json({ error: "Coupon has been fully redeemed" }, { status: 400 })
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
        }
        if (coupon.type === "PERCENTAGE") discountCents = Math.round(subtotalCents * coupon.value / 100)
        else if (coupon.type === "FIXED_AMOUNT") discountCents = Math.min(coupon.value, subtotalCents)
      }
    }

    const shippingCents = subtotalCents >= 7500 ? 0 : 799
    const taxCents = Math.round((subtotalCents - discountCents) * 0.08)
    const totalCents = subtotalCents - discountCents + shippingCents + taxCents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      metadata: {
        items: JSON.stringify(items),
        couponCode: couponCode ?? "",
        discountCents: discountCents.toString(),
        shippingCents: shippingCents.toString(),
        taxCents: taxCents.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subtotalCents,
      discountCents,
      shippingCents,
      taxCents,
      totalCents,
      coupon: coupon ? { code: coupon.code, type: coupon.type, value: coupon.value } : null,
    })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
