import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth"

export const PUT = withPermission("payments:verify")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()
      const { paymentStatus, verificationNotes } = body

      if (!paymentStatus) {
        return NextResponse.json({ error: "Payment status is required" }, { status: 400 })
      }

      const updatedPayment = await prisma.v2_payments.update({
        where: { id: params.id },
        data: {
          paymentStatus,
          verificationNotes,
        },
      })

      return NextResponse.json(updatedPayment)
    } catch (error) {
      console.error("Error verifying payment proof:", error)
      return NextResponse.json({ error: "Failed to verify payment proof" }, { status: 500 })
    }
  },
)
