import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Changed to named import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("payments:read")(async () => {
  try {
    const payments = await prisma.v2_payments.findMany({
      include: {
        booking: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
      discountAmount: Number(payment.discountAmount),
      finalAmount: Number(payment.finalAmount),
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
})

export const POST = withPermission("payments:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { bookingId, amount, discountAmount, finalAmount, paymentMethod, proofUrl, status } = body

    if (!bookingId || amount === undefined || finalAmount === undefined || !paymentMethod) {
      return NextResponse.json(
        { error: "Booking ID, amount, final amount, and payment method are required" },
        { status: 400 },
      )
    }

    const newPayment = await prisma.v2_payments.create({
      data: {
        bookingId,
        amount: Number.parseFloat(amount.toString()),
        discountAmount: Number.parseFloat((discountAmount || 0).toString()),
        finalAmount: Number.parseFloat(finalAmount.toString()),
        paymentMethod,
        proofUrl: proofUrl || null,
        status: status || "pending",
      },
    })

    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
})
