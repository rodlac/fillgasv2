import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const where = status ? { status } : {}

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              client: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where }),
    ])

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      amount: payment.amount.toNumber(),
      discountAmount: payment.discountAmount?.toNumber() || null,
      finalAmount: payment.finalAmount.toNumber(),
    }))

    return NextResponse.json({ payments: formattedPayments, total })
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
    const formattedPayment = {
      ...newPayment,
      amount: newPayment.amount.toNumber(),
      discountAmount: newPayment.discountAmount?.toNumber() || null,
      finalAmount: newPayment.finalAmount.toNumber(),
    }
    return NextResponse.json(formattedPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ message: "Failed to create payment" }, { status: 500 })
  }
}
