import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { variantId } = await params
  const { stock } = await req.json()

  if (typeof stock !== "number" || stock < 0) {
    return NextResponse.json({ error: "Invalid stock value" }, { status: 400 })
  }

  const variant = await prisma.productVariant.update({ where: { id: variantId }, data: { stock } })
  return NextResponse.json(variant)
}
