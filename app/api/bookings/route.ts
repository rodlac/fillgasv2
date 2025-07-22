import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        client: true,
        bookingServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      totalPrice: booking.totalPrice.toNumber(),
      bookingServices: booking.bookingServices.map((bs) => ({
        ...bs,
        service: {
          ...bs.service,
          price: bs.service.price.toNumber(),
        },
      })),
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clientId, deliveryAddress, deliveryDate, paymentMethod, services } = body

    if (!clientId || !deliveryAddress || !deliveryDate || !paymentMethod || !services || services.length === 0) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Calculate total price based on selected services
    let totalPrice = 0
    for (const serviceItem of services) {
      const service = await prisma.service.findUnique({
        where: { id: serviceItem.serviceId },
      })
      if (service) {
        totalPrice += service.price.toNumber() * serviceItem.quantity
      }
    }

    const newBooking = await prisma.booking.create({
      data: {
        clientId,
        deliveryAddress,
        deliveryDate: new Date(deliveryDate),
        paymentMethod,
        status: "PENDING", // Default status
        totalPrice,
        bookingServices: {
          create: services.map((serviceItem: { serviceId: string; quantity: number }) => ({
            serviceId: serviceItem.serviceId,
            quantity: serviceItem.quantity,
          })),
        },
      },
    })
    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ message: "Failed to create booking" }, { status: 500 })
  }
}
