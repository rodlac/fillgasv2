import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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
    })

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      amount: payment.amount.toNumber(),
      booking: payment.booking
        ? {
            ...payment.booking,
            totalAmount: payment.booking.totalAmount.toNumber(),
            discountAmount: payment.booking.discountAmount?.toNumber(),
            finalAmount: payment.booking.finalAmount.toNumber(),
          }
        : null,
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ message: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newPayment = await prisma.payment.create({
      data: {
        ...data,
        amount: Number.parseFloat(data.amount),
      },
    })
    const formattedPayment = {
      ...newPayment,
      amount: newPayment.amount.toNumber(),
    }
    return NextResponse.json(formattedPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ message: "Failed to create payment" }, { status: 500 })
  }
}
