import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("bookings:read")(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const booking = await prisma.v2_bookings.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        services: true,
        coupon: true,
      },
    })
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...booking,
      amount: Number(booking.amount),
      discountAmount: Number(booking.discountAmount),
      finalAmount: Number(booking.finalAmount),
      services: booking.services.map((service) => ({
        ...service,
        price: Number(service.price),
      })),
      coupon: booking.coupon
        ? {
            ...booking.coupon,
            discountValue: Number(booking.coupon.discountValue),
            minimumAmount: booking.coupon.minimumAmount ? Number(booking.coupon.minimumAmount) : null,
          }
        : null,
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
})

export const PUT = withPermission("bookings:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()
      const updatedBooking = await prisma.v2_bookings.update({
        where: { id: params.id },
        data: {
          clientId: body.clientId,
          bookingDate: new Date(body.bookingDate),
          status: body.status,
          amount: Number.parseFloat(body.amount),
          discountAmount: Number.parseFloat(body.discountAmount),
          finalAmount: Number.parseFloat(body.finalAmount),
          paymentMethod: body.paymentMethod,
          paymentStatus: body.paymentStatus,
          couponId: body.couponId || null,
          services: {
            set: body.serviceIds.map((id: string) => ({ id })), // Disconnect all and reconnect selected
          },
        },
      })
      return NextResponse.json(updatedBooking)
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
      return new Response(null, { status: 204 })
    } catch (error) {
      console.error("Error deleting booking:", error)
      return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
    }
  },
)
