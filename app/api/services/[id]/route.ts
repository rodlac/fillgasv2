import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("services:read")(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const service = await prisma.v2_services.findUnique({
      where: { id: params.id },
    })
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...service,
      price: Number(service.price), // Ensure price is a number
    })
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 })
  }
})

export const PUT = withPermission("services:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()
      const updatedService = await prisma.v2_services.update({
        where: { id: params.id },
        data: {
          ...body,
          price: Number.parseFloat(body.price.toString()), // Ensure price is stored as Decimal
        },
      })
      return NextResponse.json({
        ...updatedService,
        price: Number(updatedService.price), // Return price as number
      })
    } catch (error) {
      console.error("Error updating service:", error)
      return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
    }
  },
)

export const DELETE = withPermission("services:delete")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await prisma.v2_services.delete({
        where: { id: params.id },
      })
      return NextResponse.json({ message: "Service deleted successfully" })
    } catch (error) {
      console.error("Error deleting service:", error)
      return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }
  },
)
