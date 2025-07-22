import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("bookings:read")(async (req: NextRequest) => {
  try {
    const bookings = await prisma.v2_bookings.findMany({
      include: {
        client: true,
        services: true,
        coupon: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(
      bookings.map((booking) => ({
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
      })),
    )
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
})

export const POST = withPermission("bookings:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const newBooking = await prisma.v2_bookings.create({
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
          connect: body.serviceIds.map((id: string) => ({ id })),
        },
      },
    })
    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
})
