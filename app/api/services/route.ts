import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest) => {
  try {
    const services = await prisma.v2_services.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedServices = services.map((service) => ({
      ...service,
      price: Number(service.price),
    }))

    return NextResponse.json(formattedServices)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
})

export const POST = withPermission(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, description, price, category } = body

    const newService = await prisma.v2_services.create({
      data: {
        name,
        description,
        price: Number.parseFloat(price.toString()),
        category,
      },
    })

    const formattedService = {
      ...newService,
      price: Number(newService.price),
    }

    return NextResponse.json(formattedService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
})
