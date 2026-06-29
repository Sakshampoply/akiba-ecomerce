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
  const { name, description, brand, isActive, isPreOrder, variantId, stock, price } = body

  // Update a variant's stock/price if variantId provided
  if (variantId) {
    const update: Record<string, unknown> = {}
    if (stock !== undefined) update.stock = stock
    if (price !== undefined) update.price = Math.round(price * 100)
    const variant = await prisma.productVariant.update({ where: { id: variantId }, data: update })
    return NextResponse.json(variant)
  }

  // Update product fields
  const update: Record<string, unknown> = {}
  if (name !== undefined) update.name = name
  if (description !== undefined) update.description = description
  if (brand !== undefined) update.brand = brand
  if (isActive !== undefined) update.isActive = isActive
  if (isPreOrder !== undefined) update.isPreOrder = isPreOrder

  const product = await prisma.product.update({ where: { id }, data: update })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  await prisma.product.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
