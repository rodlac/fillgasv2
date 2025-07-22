import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest) => {
  try {
    const services = await prisma.service.findMany()
    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}, "admin")

export const POST = withPermission(async (req: NextRequest) => {
  try {
    const data = await req.json()
    const newService = await prisma.service.create({ data })
    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}, "admin")
