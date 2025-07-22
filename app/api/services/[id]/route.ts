import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 })
  }
}, "admin")

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    const data = await req.json()
    const updatedService = await prisma.service.update({
      where: { id },
      data,
    })
    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}, "admin")

export const DELETE = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ message: "Service deleted successfully" }, { status: 204 })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}, "admin")
