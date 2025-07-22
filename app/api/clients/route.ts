import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("clients:read")(async (req: NextRequest) => {
  try {
    const clients = await prisma.v2_clients.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({
      clients: clients.map((client) => ({
        ...client,
        balance: client.balance ? Number(client.balance) : 0, // Ensure balance is a number
      })),
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
})

export const POST = withPermission("clients:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const newClient = await prisma.v2_clients.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        document: body.document,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        balance: body.balance ? Number.parseFloat(body.balance) : 0,
      },
    })
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
})
