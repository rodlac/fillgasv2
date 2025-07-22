import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("payments:read")(async (req: NextRequest) => {
  try {
    const payments = await prisma.v2_payments.findMany({
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(
      payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
        discountAmount: Number(payment.discountAmount),
        finalAmount: Number(payment.finalAmount),
        booking: payment.booking
          ? {
              ...payment.booking,
              amount: Number(payment.booking.amount),
              discountAmount: Number(payment.booking.discountAmount),
              finalAmount: Number(payment.booking.finalAmount),
            }
          : null,
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
        bookingId: body.bookingId,
        amount: Number.parseFloat(body.amount),
        discountAmount: Number.parseFloat(body.discountAmount),
        finalAmount: Number.parseFloat(body.finalAmount),
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentStatus,
        transactionId: body.transactionId || null,
        proofOfPaymentUrl: body.proofOfPaymentUrl || null,
      },
    })
    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
})
