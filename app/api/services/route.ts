import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Changed to named import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("services:read")(async () => {
  try {
    const services = await prisma.v2_services.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
})

export const POST = withPermission("services:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, description, price, duration, isActive } = body

    if (!name || !price || !duration) {
      return NextResponse.json({ error: "Name, price, and duration are required" }, { status: 400 })
    }

    const newService = await prisma.v2_services.create({
      data: {
        name,
        description: description || null,
        price: Number.parseFloat(price.toString()),
        duration: Number.parseInt(duration.toString()),
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
})
