import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
  }
}
