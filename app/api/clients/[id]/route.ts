import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ message: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { name, email, phone, cpfCnpj, address, isActive } = body

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        cpfCnpj,
        address,
        isActive,
      },
    })
    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ message: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.client.update({
      where: { id: params.id },
      data: { isActive: false }, // Soft delete
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Error deactivating client:", error)
    return NextResponse.json({ message: "Failed to deactivate client" }, { status: 500 })
  }
}
