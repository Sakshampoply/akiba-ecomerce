import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { code, type, value, minOrderCents, maxUsage, expiresAt, isActive } = await req.json()

  if (!code || !type || value === undefined) {
    return NextResponse.json({ error: "Code, type, and value are required" }, { status: 400 })
  }

  if (!["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"].includes(type)) {
    return NextResponse.json({ error: "Invalid discount type" }, { status: 400 })
  }

  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (existing) {
    return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      type,
      value: type === "FIXED_AMOUNT" ? Math.round(value * 100) : Number(value),
      minOrderCents: minOrderCents ? Math.round(minOrderCents * 100) : null,
      maxUsage: maxUsage ? Number(maxUsage) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive ?? true,
    },
  })

  return NextResponse.json(coupon, { status: 201 })
}
