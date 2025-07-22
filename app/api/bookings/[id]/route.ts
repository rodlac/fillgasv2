import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("bookings:read")(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const booking = await prisma.v2_bookings.findUnique({
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
      return Response.json({ error: "Agendamento não encontrado" }, { status: 404 })
    }

    return Response.json(booking)
  } catch (error) {
    return Response.json({ error: "Erro ao buscar agendamento" }, { status: 500 })
  }
})

export const PUT = withPermission("bookings:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const body = await req.json()
    const { clientId, deliveryAddress, deliveryDate, services, paymentMethod } = body

    try {
      // Update booking
      const booking = await prisma.v2_bookings.update({
        where: { id: params.id },
        data: {
          clientId,
          deliveryAddress,
          deliveryDate: new Date(deliveryDate),
          paymentMethod,
        },
        include: {
          client: true,
          bookingServices: {
            include: {
              service: true,
            },
          },
        },
      })

      // Update services if provided
      if (services) {
        // Delete existing services
        await prisma.v2_bookingServices.deleteMany({
          where: { bookingId: params.id },
        })

        // Create new services
        await prisma.v2_bookingServices.createMany({
          data: services.map((service: any) => ({
            bookingId: params.id,
            serviceId: service.serviceId,
            quantity: service.quantity,
          })),
        })
      }

      return Response.json(booking)
    } catch (error) {
      return Response.json({ error: "Erro ao atualizar agendamento" }, { status: 500 })
    }
  },
)

export const DELETE = withPermission("bookings:delete")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await prisma.v2_bookings.update({
        where: { id: params.id },
        data: { status: "cancelled" },
      })

      return Response.json({ success: true })
    } catch (error) {
      return Response.json({ error: "Erro ao cancelar agendamento" }, { status: 500 })
    }
  },
)
