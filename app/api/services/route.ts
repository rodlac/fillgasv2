import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("services:read")(async (req: NextRequest) => {
  try {
    const services = await prisma.v2_services.findMany()
    return NextResponse.json(
      services.map((service) => ({
        ...service,
        price: Number(service.price), // Ensure price is a number
      })),
    )
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
})

export const POST = withPermission("services:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const newService = await prisma.v2_services.create({
      data: {
        ...body,
        price: Number.parseFloat(body.price.toString()), // Ensure price is stored as Decimal
      },
    })
    return NextResponse.json(
      {
        ...newService,
        price: Number(newService.price), // Return price as number
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
})
