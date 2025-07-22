import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const PUT = withPermission("payments:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()
      const { proofUrl } = body

      if (!proofUrl) {
        return NextResponse.json({ error: "Proof URL is required" }, { status: 400 })
      }

      const updatedPayment = await prisma.v2_payments.update({
        where: { id: params.id },
        data: { proofUrl },
      })

      return NextResponse.json(updatedPayment)
    } catch (error) {
      console.error("Error verifying payment proof:", error)
      return NextResponse.json({ error: "Failed to verify payment proof" }, { status: 500 })
    }
  },
)
