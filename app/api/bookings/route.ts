import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Changed to named import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("bookings:read")(async (req: NextRequest) => {
  try {
    const bookings = await prisma.v2_bookings.findMany({
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
      orderBy: { createdAt: "desc" },
    })

    const formattedBookings = bookings.map((booking) => ({
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
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
})

export const POST = withPermission("bookings:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    console.log("Received booking data:", body)

    // Validate required fields
    if (
      !body.clientId ||
      !body.deliveryAddress ||
      !body.deliveryDate ||
      !body.serviceIds ||
      body.serviceIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields: clientId, deliveryAddress, deliveryDate, and serviceIds are required" },
        { status: 400 },
      )
    }

    // Create the booking with services
    const newBooking = await prisma.v2_bookings.create({
      data: {
        clientId: body.clientId,
        deliveryAddress: body.deliveryAddress,
        deliveryDate: new Date(body.deliveryDate),
        status: body.status || "scheduled",
        paymentStatus: body.paymentStatus || "pending",
        paymentMethod: body.paymentMethod || "pix",
        amount: Number.parseFloat(body.amount.toString()),
        discountAmount: Number.parseFloat((body.discountAmount || 0).toString()),
        couponId: body.couponId || null,
        notes: body.notes || null,
        bookingServices: {
          create: body.serviceIds.map((serviceId: string) => ({
            serviceId: serviceId,
            quantity: 1, // Default quantity
          })),
        },
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
      ...newBooking,
      amount: Number(newBooking.amount),
      discountAmount: Number(newBooking.discountAmount),
      services: newBooking.bookingServices.map((bs) => ({
        ...bs.service,
        price: Number(bs.service.price),
        quantity: bs.quantity,
      })),
      coupon: newBooking.coupon
        ? {
            ...newBooking.coupon,
            discountValue: Number(newBooking.coupon.discountValue),
            minimumAmount: newBooking.coupon.minimumAmount ? Number(newBooking.coupon.minimumAmount) : null,
          }
        : null,
      payments: newBooking.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
        discountAmount: Number(payment.discountAmount),
        finalAmount: Number(payment.finalAmount),
      })),
    }

    return NextResponse.json(formattedBooking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
})
