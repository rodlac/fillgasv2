import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("clients:read")(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const client = await prisma.v2_clients.findUnique({
      where: { id: params.id },
    })
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...client,
      balance: client.balance ? Number(client.balance) : 0,
    })
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
})

export const PUT = withPermission("clients:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()
      const updatedClient = await prisma.v2_clients.update({
        where: { id: params.id },
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          document: body.document,
          address: body.address,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          balance: body.balance ? Number.parseFloat(body.balance) : undefined,
        },
      })
      return NextResponse.json(updatedClient)
    } catch (error) {
      console.error("Error updating client:", error)
      return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
    }
  },
)

export const DELETE = withPermission("clients:delete")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await prisma.v2_clients.delete({
        where: { id: params.id },
      })
      return new Response(null, { status: 204 })
    } catch (error) {
      console.error("Error deleting client:", error)
      return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
    }
  },
)
