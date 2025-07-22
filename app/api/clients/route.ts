import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("clients:read")(async (req: NextRequest) => {
  try {
    const clients = await prisma.v2_clients.findMany()
    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
})

export const POST = withPermission("clients:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const newClient = await prisma.v2_clients.create({
      data: body,
    })
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
})
