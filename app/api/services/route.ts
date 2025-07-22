import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const services = await prisma.service.findMany()
    // Ensure price is converted to a number for frontend
    const formattedServices = services.map((service) => ({
      ...service,
      price: service.price.toNumber(),
    }))
    return NextResponse.json(formattedServices)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ message: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newService = await prisma.service.create({
      data: {
        ...data,
        price: Number.parseFloat(data.price), // Ensure price is stored as Decimal
      },
    })
    // Convert price back to number for response
    const formattedService = {
      ...newService,
      price: newService.price.toNumber(),
    }
    return NextResponse.json(formattedService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ message: "Failed to create service" }, { status: 500 })
  }
}
