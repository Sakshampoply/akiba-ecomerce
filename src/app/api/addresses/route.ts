import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { label, name, line1, line2, city, state, zip, country, phone, isDefault } = await req.json()

  if (!name || !line1 || !city || !zip) {
    return NextResponse.json({ error: "Name, address, city, and zip are required" }, { status: 400 })
  }

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } })
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: label ?? "Home",
      name,
      line1,
      line2: line2 ?? null,
      city,
      state: state ?? "",
      zip,
      country: country ?? "US",
      phone: phone ?? null,
      isDefault: isDefault ?? false,
    },
  })

  return NextResponse.json(address, { status: 201 })
}
