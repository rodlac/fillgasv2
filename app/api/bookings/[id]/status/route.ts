import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  const { status } = await req.json()

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 })
  }

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    })
    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
  }
}, "admin")
