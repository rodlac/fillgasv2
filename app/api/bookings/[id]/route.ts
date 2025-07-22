import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("bookings:read")(async (req: NextRequest, { params }: { params: { id: string } }) => {
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

export const PUT = withPermission("bookings:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()

      // Update the booking
      const updatedBooking = await prisma.v2_bookings.update({
        where: { id: params.id },
        data: {
          deliveryAddress: body.deliveryAddress,
          deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
          status: body.status,
          paymentStatus: body.paymentStatus,
          paymentMethod: body.paymentMethod,
          amount: body.amount ? Number.parseFloat(body.amount.toString()) : undefined,
          discountAmount: body.discountAmount ? Number.parseFloat(body.discountAmount.toString()) : undefined,
          couponId: body.couponId || null,
          notes: body.notes,
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

      // Update services if provided
      if (body.serviceIds && Array.isArray(body.serviceIds)) {
        // Delete existing services
        await prisma.v2_bookingServices.deleteMany({
          where: { bookingId: params.id },
        })

        // Create new services
        await prisma.v2_bookingServices.createMany({
          data: body.serviceIds.map((serviceId: string) => ({
            bookingId: params.id,
            serviceId: serviceId,
            quantity: 1,
          })),
        })
      }

      // Fetch updated booking with services
      const finalBooking = await prisma.v2_bookings.findUnique({
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

      if (!finalBooking) {
        return NextResponse.json({ error: "Booking not found after update" }, { status: 404 })
      }

      const formattedBooking = {
        ...finalBooking,
        amount: Number(finalBooking.amount),
        discountAmount: Number(finalBooking.discountAmount),
        services: finalBooking.bookingServices.map((bs) => ({
          ...bs.service,
          price: Number(bs.service.price),
          quantity: bs.quantity,
        })),
        coupon: finalBooking.coupon
          ? {
              ...finalBooking.coupon,
              discountValue: Number(finalBooking.coupon.discountValue),
              minimumAmount: finalBooking.coupon.minimumAmount ? Number(finalBooking.coupon.minimumAmount) : null,
            }
          : null,
        payments: finalBooking.payments.map((payment) => ({
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
  },
)

export const DELETE = withPermission("bookings:delete")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await prisma.v2_bookings.delete({
        where: { id: params.id },
      })

      return NextResponse.json({ message: "Booking deleted successfully" })
    } catch (error) {
      console.error("Error deleting booking:", error)
      return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
    }
  },
)
