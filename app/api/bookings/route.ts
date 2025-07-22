import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        client: true,
        services: true,
        coupon: true,
        payment: true,
      },
    })

    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      totalAmount: booking.totalAmount.toNumber(),
      discountAmount: booking.discountAmount?.toNumber(),
      finalAmount: booking.finalAmount.toNumber(),
      services: booking.services.map((service) => ({
        ...service,
        price: service.price.toNumber(),
      })),
      coupon: booking.coupon
        ? {
            ...booking.coupon,
            discountValue: booking.coupon.discountValue.toNumber(),
            minimumAmount: booking.coupon.minimumAmount?.toNumber(),
          }
        : null,
      payment: booking.payment
        ? {
            ...booking.payment,
            amount: booking.payment.amount.toNumber(),
          }
        : null,
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { client, services, couponId, ...bookingData } = data

    const newBooking = await prisma.booking.create({
      data: {
        ...bookingData,
        totalAmount: Number.parseFloat(bookingData.totalAmount),
        discountAmount: bookingData.discountAmount ? Number.parseFloat(bookingData.discountAmount) : null,
        finalAmount: Number.parseFloat(bookingData.finalAmount),
        client: {
          connect: { id: client.id },
        },
        services: {
          connect: services.map((service: { id: string }) => ({
            id: service.id,
          })),
        },
        ...(couponId && { coupon: { connect: { id: couponId } } }),
      },
      include: {
        client: true,
        services: true,
        coupon: true,
        payment: true,
      },
    })

    const formattedBooking = {
      ...newBooking,
      totalAmount: newBooking.totalAmount.toNumber(),
      discountAmount: newBooking.discountAmount?.toNumber(),
      finalAmount: newBooking.finalAmount.toNumber(),
      services: newBooking.services.map((service) => ({
        ...service,
        price: service.price.toNumber(),
      })),
      coupon: newBooking.coupon
        ? {
            ...newBooking.coupon,
            discountValue: newBooking.coupon.discountValue.toNumber(),
            minimumAmount: newBooking.coupon.minimumAmount?.toNumber(),
          }
        : null,
      payment: newBooking.payment
        ? {
            ...newBooking.payment,
            amount: newBooking.payment.amount.toNumber(),
          }
        : null,
    }

    return NextResponse.json(formattedBooking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ message: "Failed to create booking" }, { status: 500 })
  }
}
