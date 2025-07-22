import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("payments:read")(async (req: NextRequest) => {
  try {
    const payments = await prisma.v2_payments.findMany({
      include: {
        booking: true,
      },
    })
    return NextResponse.json(
      payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
        discountAmount: Number(payment.discountAmount),
        finalAmount: Number(payment.finalAmount),
      })),
    )
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
})

export const POST = withPermission("payments:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const newPayment = await prisma.v2_payments.create({
      data: {
        ...body,
        amount: Number.parseFloat(body.amount.toString()),
        discountAmount: Number.parseFloat((body.discountAmount || 0).toString()),
        finalAmount: Number.parseFloat(body.finalAmount.toString()),
      },
    })
    return NextResponse.json(
      {
        ...newPayment,
        amount: Number(newPayment.amount),
        discountAmount: Number(newPayment.discountAmount),
        finalAmount: Number(newPayment.finalAmount),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
})
