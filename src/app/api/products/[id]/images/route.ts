import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { url, altText, position = 0 } = await req.json()
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 })

  const image = await prisma.productImage.create({
    data: { productId: id, url, altText: altText || null, position },
  })

  return NextResponse.json(image, { status: 201 })
}
