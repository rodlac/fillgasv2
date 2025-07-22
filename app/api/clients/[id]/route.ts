import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Changed to named import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("clients:read")(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const client = await prisma.v2_clients.findUnique({
      where: { id: params.id },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
})

export const PUT = withPermission("clients:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()
      const { name, email, phone, address, notes } = body

      if (!name || !email || !phone) {
        return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 })
      }

      const updatedClient = await prisma.v2_clients.update({
        where: { id: params.id },
        data: {
          name,
          email,
          phone,
          address: address || null,
          notes: notes || null,
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

      return NextResponse.json({ message: "Client deleted successfully" })
    } catch (error) {
      console.error("Error deleting client:", error)
      return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
    }
  },
)
