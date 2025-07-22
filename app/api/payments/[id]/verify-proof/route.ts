import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const POST = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    const { verified } = body

    const updatedPayment = await prisma.v2_payments.update({
      where: { id: params.id },
      data: {
        status: verified ? "VERIFIED" : "REJECTED",
        verifiedAt: verified ? new Date() : null,
      },
    })

    // If payment is verified, update booking payment status
    if (verified) {
      await prisma.v2_bookings.update({
        where: { id: updatedPayment.bookingId },
        data: {
          paymentStatus: "PAID",
        },
      })
    }

    const formattedPayment = {
      ...updatedPayment,
      amount: Number(updatedPayment.amount),
      discountAmount: Number(updatedPayment.discountAmount),
      finalAmount: Number(updatedPayment.finalAmount),
    }

    return NextResponse.json(formattedPayment)
  } catch (error) {
    console.error("Error verifying payment proof:", error)
    return NextResponse.json({ error: "Failed to verify payment proof" }, { status: 500 })
  }
})
