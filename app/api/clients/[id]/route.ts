import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    const client = await prisma.client.findUnique({ where: { id } })
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}, "admin")

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    const data = await req.json()
    const updatedClient = await prisma.client.update({
      where: { id },
      data,
    })
    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}, "admin")

export const DELETE = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ message: "Client deleted successfully" }, { status: 204 })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}, "admin")
