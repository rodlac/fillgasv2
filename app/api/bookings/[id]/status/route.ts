import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    const { status } = body

    const updatedBooking = await prisma.v2_bookings.update({
      where: { id: params.id },
      data: { status },
      include: {
        client: true,
        bookingServices: {
          include: {
            service: true,
          },
        },
        coupon: true,
        payments: true,
      },
    })

    const formattedBooking = {
      ...updatedBooking,
      amount: Number(updatedBooking.amount),
      discountAmount: Number(updatedBooking.discountAmount),
      services: updatedBooking.bookingServices.map((bs) => ({
        ...bs.service,
        price: Number(bs.service.price),
        quantity: bs.quantity,
      })),
      coupon: updatedBooking.coupon
        ? {
            ...updatedBooking.coupon,
            discountValue: Number(updatedBooking.coupon.discountValue),
            minimumAmount: updatedBooking.coupon.minimumAmount ? Number(updatedBooking.coupon.minimumAmount) : null,
          }
        : null,
      payments: updatedBooking.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
        discountAmount: Number(payment.discountAmount),
        finalAmount: Number(payment.finalAmount),
      })),
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
  }
})
