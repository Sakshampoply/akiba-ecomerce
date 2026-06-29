import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { name, description, brand, isPreOrder, categoryId, variants } = body

  if (!name || !variants?.length) {
    return NextResponse.json({ error: "Name and at least one variant required" }, { status: 400 })
  }

  const slug = slugify(name)
  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: "A product with this name already exists" }, { status: 409 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description ?? "",
      brand: brand ?? "",
      isPreOrder: isPreOrder ?? false,
      isActive: true,
      variants: {
        create: variants.map((v: { sku: string; price: number; compareAt?: number; stock: number; size?: string; isDefault?: boolean }, i: number) => ({
          sku: v.sku,
          price: Math.round(v.price * 100),
          compareAt: v.compareAt ? Math.round(v.compareAt * 100) : null,
          stock: v.stock ?? 0,
          size: v.size ?? null,
          isDefault: i === 0,
        })),
      },
      categories: categoryId
        ? { create: { categoryId } }
        : undefined,
    },
    include: { variants: true },
  })

  return NextResponse.json(product, { status: 201 })
}
