import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        client: true,
        coupon: true,
        services: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}, "admin")

export const POST = withPermission(async (req: NextRequest) => {
  try {
    const {
      clientId,
      bookingDate,
      serviceIds,
      couponCode,
      paymentMethod,
      paymentStatus,
      amount,
      discountAmount,
      finalAmount,
    } = await req.json()

    const newBooking = await prisma.booking.create({
      data: {
        clientId,
        bookingDate: new Date(bookingDate),
        paymentMethod,
        paymentStatus,
        amount,
        discountAmount,
        finalAmount,
        status: "pending", // Default status
        services: {
          connect: serviceIds.map((id: string) => ({ id })),
        },
        ...(couponCode && {
          coupon: {
            connect: { code: couponCode },
          },
        }),
      },
    })
    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}, "admin")
