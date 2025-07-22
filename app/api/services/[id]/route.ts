import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
    })
    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 })
    }
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
    const body = await req.json()
    const { name, price, isActive } = body

    const updatedService = await prisma.service.update({
      where: { id: params.id },
      data: {
        name,
        price: Number.parseFloat(price),
        isActive,
      },
    })
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.service.delete({
      where: { id: params.id },
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ message: "Failed to delete service" }, { status: 500 })
  }
}
