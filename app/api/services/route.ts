import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    })
    // Convert Decimal to number for frontend consumption
    const formattedServices = services.map((service) => ({
      ...service,
      price: service.price.toNumber(), // Ensure price is a number
    }))
    return NextResponse.json(formattedServices)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ message: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, price, isActive } = body

    if (!name || price === undefined) {
      return NextResponse.json({ message: "Name and price are required" }, { status: 400 })
    }

    const newService = await prisma.service.create({
      data: {
        name,
        price: Number.parseFloat(price), // Ensure price is stored as Decimal
        isActive: isActive ?? true,
      },
    })
    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ message: "Failed to create service" }, { status: 500 })
  }
}
