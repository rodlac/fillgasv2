import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const service = await prisma.v2_services.findUnique({
      where: { id: params.id },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const formattedService = {
      ...service,
      price: Number(service.price),
    }

    return NextResponse.json(formattedService)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 })
  }
})

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    const { name, description, price, category } = body

    const updatedService = await prisma.v2_services.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: Number.parseFloat(price.toString()),
        category,
      },
    })

    const formattedService = {
      ...updatedService,
      price: Number(updatedService.price),
    }

    return NextResponse.json(formattedService)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
})

export const DELETE = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.v2_services.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
})
