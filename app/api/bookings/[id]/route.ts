import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(async () => {
    try {
      const booking = await prisma.booking.findUnique({
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

      return NextResponse.json(booking)
    } catch (error) {
      console.error("Error fetching booking:", error)
      return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(async () => {
    try {
      const body = await request.json()
      const {
        clientId,
        deliveryAddress,
        deliveryDate,
        status,
        amount,
        discountAmount,
        paymentMethod,
        paymentStatus,
        couponId,
        serviceIds,
        notes,
      } = body

      // First, disconnect all existing services
      await prisma.booking.update({
        where: { id: params.id },
        data: {
          services: {
            set: [],
          },
        },
      })

      // Then update the booking with new data
      const booking = await prisma.booking.update({
        where: { id: params.id },
        data: {
          clientId,
          deliveryAddress,
          deliveryDate: new Date(deliveryDate),
          status,
          amount: Number.parseFloat(amount.toString()),
          discountAmount: Number.parseFloat(discountAmount.toString()),
          paymentMethod,
          paymentStatus,
          couponId,
          notes,
          services: {
            connect: serviceIds.map((id: string) => ({ id })),
          },
        },
        include: {
          client: true,
          services: true,
          coupon: true,
        },
      })

      return NextResponse.json(booking)
    } catch (error) {
      console.error("Error updating booking:", error)
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(async () => {
    try {
      await prisma.booking.delete({
        where: { id: params.id },
      })

      return NextResponse.json({ message: "Booking deleted successfully" })
    } catch (error) {
      console.error("Error deleting booking:", error)
      return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
    }
  })
}
