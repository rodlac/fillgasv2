import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Changed to named import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("clients:read")(async () => {
  try {
    const clients = await prisma.v2_clients.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
})

export const POST = withPermission("clients:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, email, phone, address, notes } = body

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 })
    }

    const newClient = await prisma.v2_clients.create({
      data: {
        name,
        email,
        phone,
        address: address || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
})
