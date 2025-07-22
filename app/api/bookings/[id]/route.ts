import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
        bookingServices: {
          include: {
            service: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    const formattedBooking = {
      ...booking,
      totalPrice: booking.totalPrice.toNumber(),
      bookingServices: booking.bookingServices.map((bs) => ({
        ...bs,
        service: {
          ...bs.service,
          price: bs.service.price.toNumber(),
        },
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
    const { id } = params
    const body = await req.json()
    const { clientId, deliveryAddress, deliveryDate, paymentMethod, services, status } = body

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

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        clientId,
        deliveryAddress,
        deliveryDate: new Date(deliveryDate),
        paymentMethod,
        status: status ?? undefined,
        totalPrice,
        bookingServices: {
          deleteMany: {}, // Remove existing services
          create: services.map((serviceItem: { serviceId: string; quantity: number }) => ({
            serviceId: serviceItem.serviceId,
            quantity: serviceItem.quantity,
          })),
        },
      },
    })
    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ message: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await prisma.booking.delete({
      where: { id },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ message: "Failed to delete booking" }, { status: 500 })
  }
}
