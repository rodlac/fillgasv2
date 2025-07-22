import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      amount: payment.amount.toNumber(),
      discountAmount: payment.discountAmount?.toNumber() || null,
      finalAmount: payment.finalAmount.toNumber(),
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ message: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bookingId, amount, discountAmount, finalAmount, paymentMethod, status, transactionId, proofOfPaymentUrl } =
      body

    if (!bookingId || amount === undefined || finalAmount === undefined || !paymentMethod || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const newPayment = await prisma.payment.create({
      data: {
        bookingId,
        amount: Number.parseFloat(amount),
        discountAmount: discountAmount ? Number.parseFloat(discountAmount) : null,
        finalAmount: Number.parseFloat(finalAmount),
        paymentMethod,
        status,
        transactionId,
        proofOfPaymentUrl,
      },
    })
    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ message: "Failed to create payment" }, { status: 500 })
  }
}
