import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ message: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.client.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Client deleted" }, { status: 204 })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ message: "Failed to delete client" }, { status: 500 })
  }
}
