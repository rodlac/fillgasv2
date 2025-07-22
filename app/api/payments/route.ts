import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
    })
    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}, "admin")

export const POST = withPermission(async (req: NextRequest) => {
  try {
    const data = await req.json()
    const newPayment = await prisma.payment.create({ data })
    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}, "admin")
