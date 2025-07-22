import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const booking = await prisma.v2_bookings.findUnique({
      where: { id: params.id },
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

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const formattedBooking = {
      ...booking,
      amount: Number(booking.amount),
      discountAmount: Number(booking.discountAmount),
      services: booking.bookingServices.map((bs) => ({
        ...bs.service,
        price: Number(bs.service.price),
        quantity: bs.quantity,
      })),
      coupon: booking.coupon
        ? {
            ...booking.coupon,
            discountValue: Number(booking.coupon.discountValue),
            minimumAmount: booking.coupon.minimumAmount ? Number(booking.coupon.minimumAmount) : null,
          }
        : null,
      payments: booking.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
        discountAmount: Number(payment.discountAmount),
        finalAmount: Number(payment.finalAmount),
      })),
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
})

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()

    const updatedBooking = await prisma.v2_bookings.update({
      where: { id: params.id },
      data: {
        clientId: body.clientId,
        deliveryAddress: body.deliveryAddress,
        deliveryDate: new Date(body.deliveryDate),
        status: body.status,
        paymentStatus: body.paymentStatus,
        paymentMethod: body.paymentMethod,
        amount: Number.parseFloat(body.amount.toString()),
        discountAmount: Number.parseFloat((body.discountAmount || 0).toString()),
        couponId: body.couponId || null,
        notes: body.notes || null,
      },
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
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
})

export const DELETE = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.v2_bookings.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
})
