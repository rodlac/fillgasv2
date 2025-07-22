import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("bookings:read")(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId")
  const status = searchParams.get("status")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  const where: any = {}

  if (clientId) where.clientId = clientId
  if (status) where.status = status
  if (startDate || endDate) {
    where.deliveryDate = {}
    if (startDate) where.deliveryDate.gte = new Date(startDate)
    if (endDate) where.deliveryDate.lte = new Date(endDate)
  }

  const [bookings, total] = await Promise.all([
    prisma.v2_bookings.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.v2_bookings.count({ where }),
  ])

  return Response.json({ bookings, total })
})

export const POST = withPermission("bookings:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { clientId, deliveryAddress, deliveryDate, services, paymentMethod, couponId } = body

    // Validate client
    const client = await prisma.v2_clients.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return Response.json({ error: "Cliente não encontrado" }, { status: 400 })
    }

    // Validate services and calculate total
    let totalAmount = 0
    const serviceData = []

    for (const serviceItem of services) {
      const service = await prisma.v2_services.findUnique({
        where: { id: serviceItem.serviceId },
      })

      if (!service || !service.isActive) {
        return Response.json({ error: `Serviço ${serviceItem.serviceId} não encontrado ou inativo` }, { status: 400 })
      }

      const itemTotal = Number(service.price) * serviceItem.quantity
      totalAmount += itemTotal

      serviceData.push({
        serviceId: serviceItem.serviceId,
        quantity: serviceItem.quantity,
      })
    }

    // Apply coupon if provided
    let discountAmount = 0
    if (couponId) {
      const coupon = await prisma.v2_coupons.findUnique({
        where: { id: couponId },
      })

      if (coupon && coupon.isActive) {
        // Validate coupon rules
        const now = new Date()
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (!coupon.minimumAmount || totalAmount >= Number(coupon.minimumAmount)) {
            if (coupon.discountType === "percentage") {
              discountAmount = (totalAmount * Number(coupon.discountValue)) / 100
            } else {
              discountAmount = Number(coupon.discountValue)
            }
          }
        }
      }
    }

    // Create booking
    const booking = await prisma.v2_bookings.create({
      data: {
        clientId,
        deliveryAddress,
        deliveryDate: new Date(deliveryDate),
        paymentMethod,
        amount: totalAmount,
        discountAmount,
        couponId,
        bookingServices: {
          create: serviceData,
        },
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

    // Create payment record
    const finalAmount = totalAmount - discountAmount
    await prisma.v2_payments.create({
      data: {
        bookingId: booking.id,
        amount: totalAmount,
        discountAmount,
        finalAmount,
        paymentMethod,
        status: paymentMethod === "BANK_TRANSFER" ? "awaiting_transfer" : "pending",
      },
    })

    // Record coupon usage if applicable
    if (couponId && discountAmount > 0) {
      await prisma.v2_couponUsages.create({
        data: {
          couponId,
          bookingId: booking.id,
          clientId,
          discountAmount,
        },
      })

      // Update coupon usage count
      await prisma.v2_coupons.update({
        where: { id: couponId },
        data: {
          currentUsage: {
            increment: 1,
          },
        },
      })
    }

    return Response.json(booking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return Response.json({ error: "Erro ao criar agendamento" }, { status: 500 })
  }
})
