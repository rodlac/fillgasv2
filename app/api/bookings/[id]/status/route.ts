import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
    })
    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ message: "Failed to update booking status" }, { status: 500 })
  }
}
