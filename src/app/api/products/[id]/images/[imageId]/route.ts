import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { del } from "@vercel/blob"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { imageId } = await params
  const image = await prisma.productImage.findUnique({ where: { id: imageId } })
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Delete from Vercel Blob if it's a blob URL
  if (image.url.includes("vercel-storage.com")) {
    await del(image.url).catch(() => {})
  }

  await prisma.productImage.delete({ where: { id: imageId } })
  return NextResponse.json({ ok: true })
}
