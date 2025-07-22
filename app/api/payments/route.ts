import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: true,
      },
    })
    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { bookingId, amount, paymentMethod, status, transactionId } = await request.json()

    const newPayment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        paymentMethod,
        status,
        transactionId,
      },
    })

    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
