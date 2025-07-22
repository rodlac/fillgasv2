import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
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
      prisma.booking.findMany({
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
      prisma.booking.count({ where }),
    ])

    const formattedBookings = bookings.map((booking) => ({
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
    }))

    return NextResponse.json({ bookings: formattedBookings, total })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clientId, deliveryAddress, deliveryDate, services, paymentMethod, couponId } = body

    // Validate client
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 400 })
    }

    // Validate services and calculate total
    let totalAmount = 0
    const serviceData = []

    for (const serviceItem of services) {
      const service = await prisma.service.findUnique({
        where: { id: serviceItem.serviceId },
      })

      if (!service || !service.isActive) {
        return NextResponse.json(
          { error: `Serviço ${serviceItem.serviceId} não encontrado ou inativo` },
          { status: 400 },
        )
      }

      const itemTotal = service.price.toNumber() * serviceItem.quantity
      totalAmount += itemTotal

      serviceData.push({
        serviceId: serviceItem.serviceId,
        quantity: serviceItem.quantity,
      })
    }

    // Apply coupon if provided
    let discountAmount = 0
    if (couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      })

      if (coupon && coupon.isActive) {
        // Validate coupon rules
        const now = new Date()
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (!coupon.minimumAmount || totalAmount >= coupon.minimumAmount.toNumber()) {
            if (coupon.discountType === "percentage") {
              discountAmount = (totalAmount * coupon.discountValue.toNumber()) / 100
            } else {
              discountAmount = coupon.discountValue.toNumber()
            }
          }
        }
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clientId,
        deliveryAddress,
        deliveryDate: new Date(deliveryDate),
        paymentMethod,
        totalPrice: totalAmount,
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
    await prisma.payment.create({
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
      await prisma.couponUsage.create({
        data: {
          couponId,
          bookingId: booking.id,
          clientId,
          discountAmount,
        },
      })

      // Update coupon usage count
      await prisma.coupon.update({
        where: { id: couponId },
        data: {
          currentUsage: {
            increment: 1,
          },
        },
      })
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
    }

    return NextResponse.json(formattedBooking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 })
  }
}
