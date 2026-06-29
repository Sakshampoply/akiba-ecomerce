import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (body.isActive !== undefined) update.isActive = body.isActive
  if (body.maxUsage !== undefined) update.maxUsage = body.maxUsage
  if (body.expiresAt !== undefined) update.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

  const coupon = await prisma.coupon.update({ where: { id }, data: update })
  return NextResponse.json(coupon)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const coupon = await prisma.coupon.findUnique({ where: { id } })
  if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (coupon.usageCount > 0) {
    // Soft delete — deactivate instead of hard delete to preserve order history
    await prisma.coupon.update({ where: { id }, data: { isActive: false } })
  } else {
    await prisma.coupon.delete({ where: { id } })
  }

  return NextResponse.json({ success: true })
}
