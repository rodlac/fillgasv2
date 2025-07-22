import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
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
