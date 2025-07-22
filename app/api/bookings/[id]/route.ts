import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const booking = await prisma.booking.findUnique({
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
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    const formattedBooking = {
      ...booking,
      totalPrice: booking.totalPrice.toNumber(),
      discountAmount: booking.discountAmount?.toNumber() || null,
      bookingServices: booking.bookingServices.map((bs) => ({
        ...bs,
        service: {
          ...bs.service,
          price: bs.service.price.toNumber(),
        },
      })),
      coupon: booking.coupon
        ? {
            ...booking.coupon,
            discountValue: booking.coupon.discountValue.toNumber(),
            minimumAmount: booking.coupon.minimumAmount?.toNumber() || null,
          }
        : null,
      payments: booking.payments.map((payment) => ({
        ...payment,
        amount: payment.amount.toNumber(),
        discountAmount: payment.discountAmount?.toNumber() || null,
        finalAmount: payment.finalAmount.toNumber(),
      })),
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ message: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { clientId, deliveryAddress, deliveryDate, paymentMethod, status, services, couponId } = body

    // Recalculate total price if services are updated
    let newTotalPrice = 0
    if (services && services.length > 0) {
      for (const serviceItem of services) {
        const service = await prisma.service.findUnique({
          where: { id: serviceItem.serviceId },
        })
        if (service) {
          newTotalPrice += service.price.toNumber() * serviceItem.quantity
        }
      }
    } else {
      // If services are not provided, keep current total price
      const currentBooking = await prisma.booking.findUnique({ where: { id: params.id } })
      if (currentBooking) {
        newTotalPrice = currentBooking.totalPrice.toNumber()
      }
    }

    // Recalculate discount if coupon is updated or total price changed
    let newDiscountAmount = 0
    if (couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      })
      if (coupon && coupon.isActive) {
        const now = new Date()
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (!coupon.minimumAmount || newTotalPrice >= coupon.minimumAmount.toNumber()) {
            if (coupon.discountType === "percentage") {
              newDiscountAmount = (newTotalPrice * coupon.discountValue.toNumber()) / 100
            } else {
              newDiscountAmount = coupon.discountValue.toNumber()
            }
          }
        }
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        clientId,
        deliveryAddress,
        deliveryDate: new Date(deliveryDate),
        paymentMethod,
        status,
        totalPrice: newTotalPrice,
        discountAmount: newDiscountAmount,
        couponId,
        ...(services && {
          bookingServices: {
            deleteMany: {}, // Clear existing services
            create: services.map((serviceItem: { serviceId: string; quantity: number }) => ({
              serviceId: serviceItem.serviceId,
              quantity: serviceItem.quantity,
            })),
          },
        }),
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
      totalPrice: updatedBooking.totalPrice.toNumber(),
      discountAmount: updatedBooking.discountAmount?.toNumber() || null,
      bookingServices: updatedBooking.bookingServices.map((bs) => ({
        ...bs,
        service: {
          ...bs.service,
          price: bs.service.price.toNumber(),
        },
      })),
      coupon: updatedBooking.coupon
        ? {
            ...updatedBooking.coupon,
            discountValue: updatedBooking.coupon.discountValue.toNumber(),
            minimumAmount: updatedBooking.coupon.minimumAmount?.toNumber() || null,
          }
        : null,
      payments: updatedBooking.payments.map((payment) => ({
        ...payment,
        amount: payment.amount.toNumber(),
        discountAmount: payment.discountAmount?.toNumber() || null,
        finalAmount: payment.finalAmount.toNumber(),
      })),
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ message: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.booking.delete({
      where: { id: params.id },
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ message: "Failed to delete booking" }, { status: 500 })
  }
}
