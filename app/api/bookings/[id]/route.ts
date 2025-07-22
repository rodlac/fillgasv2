import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
        coupon: true,
        services: true,
      },
    })
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}, "admin")

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
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
      status,
    } = await req.json()

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        clientId,
        bookingDate: new Date(bookingDate),
        paymentMethod,
        paymentStatus,
        amount,
        discountAmount,
        finalAmount,
        status,
        services: {
          set: serviceIds.map((serviceId: string) => ({ id: serviceId })), // Disconnect all existing and connect new ones
        },
        ...(couponCode
          ? {
              coupon: {
                connect: { code: couponCode },
              },
            }
          : {
              coupon: {
                disconnect: true, // Disconnect if couponCode is null/undefined
              },
            }),
      },
    })
    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}, "admin")

export const DELETE = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ message: "Booking deleted successfully" }, { status: 204 })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}, "admin")
