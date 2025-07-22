import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export async function GET() {
  return withPermission(async () => {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          client: true,
          services: true,
          coupon: true,
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
  })
}

export async function POST(request: NextRequest) {
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

      // Validate required fields
      if (!clientId || !deliveryAddress || !deliveryDate || !serviceIds || serviceIds.length === 0) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      // Create booking with services
      const booking = await prisma.booking.create({
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

      return NextResponse.json(booking, { status: 201 })
    } catch (error) {
      console.error("Error creating booking:", error)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }
  })
}
