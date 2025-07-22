import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Changed to named import
import { withPermission } from "@/lib/auth"

export const PUT = withPermission("bookings:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()
      const { status } = body

      if (!status) {
        return NextResponse.json({ error: "Status is required" }, { status: 400 })
      }

      const updatedBooking = await prisma.v2_bookings.update({
        where: { id: params.id },
        data: { status },
      })

      return NextResponse.json(updatedBooking)
    } catch (error) {
      console.error("Error updating booking status:", error)
      return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
    }
  },
)
