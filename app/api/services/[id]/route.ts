import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
    })
    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 })
    }
    // Ensure price is converted to a number for frontend
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const updatedService = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...data,
        price: Number.parseFloat(data.price), // Ensure price is stored as Decimal
      },
    })
    // Convert price back to number for response
    const formattedService = {
      ...updatedService,
      price: updatedService.price.toNumber(),
    }
    return NextResponse.json(formattedService)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ message: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.service.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Service deleted" }, { status: 204 })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ message: "Failed to delete service" }, { status: 500 })
  }
}
