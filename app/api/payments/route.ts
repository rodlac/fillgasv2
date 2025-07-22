import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest) => {
  try {
    const payments = await prisma.v2_payments.findMany({
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
      discountAmount: Number(payment.discountAmount),
      finalAmount: Number(payment.finalAmount),
      booking: {
        ...payment.booking,
        amount: Number(payment.booking.amount),
        discountAmount: Number(payment.booking.discountAmount),
      },
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
})

export const POST = withPermission(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { bookingId, method, amount, discountAmount, finalAmount, proofImageUrl } = body

    const newPayment = await prisma.v2_payments.create({
      data: {
        bookingId,
        method,
        amount: Number.parseFloat(amount.toString()),
        discountAmount: Number.parseFloat((discountAmount || 0).toString()),
        finalAmount: Number.parseFloat(finalAmount.toString()),
        status: "PENDING",
        proofImageUrl,
      },
    })

    const formattedPayment = {
      ...newPayment,
      amount: Number(newPayment.amount),
      discountAmount: Number(newPayment.discountAmount),
      finalAmount: Number(newPayment.finalAmount),
    }

    return NextResponse.json(formattedPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
})
