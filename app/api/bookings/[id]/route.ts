import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        services: true,
        coupon: true,
        payment: true,
      },
    })
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    const formattedBooking = {
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
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ message: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { client, services, couponId, ...bookingData } = data

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...bookingData,
        totalAmount: Number.parseFloat(bookingData.totalAmount),
        discountAmount: bookingData.discountAmount ? Number.parseFloat(bookingData.discountAmount) : null,
        finalAmount: Number.parseFloat(bookingData.finalAmount),
        client: {
          connect: { id: client.id },
        },
        services: {
          set: services.map((service: { id: string }) => ({ id: service.id })), // Use set to update many-to-many
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
      ...updatedBooking,
      totalAmount: updatedBooking.totalAmount.toNumber(),
      discountAmount: updatedBooking.discountAmount?.toNumber(),
      finalAmount: updatedBooking.finalAmount.toNumber(),
      services: updatedBooking.services.map((service) => ({
        ...service,
        price: service.price.toNumber(),
      })),
      coupon: updatedBooking.coupon
        ? {
            ...updatedBooking.coupon,
            discountValue: updatedBooking.coupon.discountValue.toNumber(),
            minimumAmount: updatedBooking.coupon.minimumAmount?.toNumber(),
          }
        : null,
      payment: updatedBooking.payment
        ? {
            ...updatedBooking.payment,
            amount: updatedBooking.payment.amount.toNumber(),
          }
        : null,
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ message: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.booking.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Booking deleted" }, { status: 204 })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ message: "Failed to delete booking" }, { status: 500 })
  }
}
