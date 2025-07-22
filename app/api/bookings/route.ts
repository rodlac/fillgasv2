import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
      orderBy: {
        deliveryDate: "desc",
      },
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
    console.log("Creating booking with data:", body)

    const newBooking = await prisma.v2_bookings.create({
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
        bookingServices: {
          create: body.serviceIds.map((serviceId: string) => ({
            serviceId: serviceId,
            quantity: 1, // Assuming quantity is always 1 for now
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
