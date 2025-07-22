import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 })
    }

    // Convert Decimal to number for frontend consumption
    const formattedService = {
      ...service,
      price: service.price.toNumber(),
    }

    return NextResponse.json(formattedService)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ message: "Failed to fetch service" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    const { name, price, isActive } = body

    if (!name || price === undefined) {
      return NextResponse.json({ message: "Name and price are required" }, { status: 400 })
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        price: Number.parseFloat(price),
        isActive: isActive ?? undefined,
      },
    })
    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ message: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await prisma.service.delete({
      where: { id },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ message: "Failed to delete service" }, { status: 500 })
  }
}
