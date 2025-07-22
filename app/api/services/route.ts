import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("services:read")(async (req: NextRequest) => {
  try {
    const services = await prisma.v2_services.findMany({
      orderBy: { createdAt: "desc" },
    })
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
        name: body.name,
        description: body.description,
        price: Number.parseFloat(body.price),
        isActive: body.isActive,
      },
    })
    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
})
