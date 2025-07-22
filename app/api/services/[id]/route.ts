import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
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
      price: Number(service.price),
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
          name: body.name,
          description: body.description,
          price: Number.parseFloat(body.price),
          isActive: body.isActive,
        },
      })
      return NextResponse.json(updatedService)
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
      return new Response(null, { status: 204 })
    } catch (error) {
      console.error("Error deleting service:", error)
      return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }
  },
)
