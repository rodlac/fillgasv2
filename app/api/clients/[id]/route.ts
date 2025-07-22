import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
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

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    const { name, email, phone, address } = body

    const updatedClient = await prisma.v2_clients.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        address,
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
})

export const DELETE = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.v2_clients.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
})
