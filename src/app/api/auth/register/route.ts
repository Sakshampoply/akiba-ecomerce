import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: { name, email, passwordHash, role: "CUSTOMER" },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
