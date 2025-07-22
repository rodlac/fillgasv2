import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const POST = withPermission("payments:verify")(
  async (req: NextRequest, { params }: { params: { id: string } }, user: any) => {
    const body = await req.json()
    const { approved, notes } = body

    try {
      const payment = await prisma.v2_payments.update({
        where: { id: params.id },
        data: {
          status: approved ? "proof_verified" : "proof_rejected",
          verifiedBy: user.id,
          verificationNotes: notes,
        },
      })

      // Update booking payment status if approved
      if (approved) {
        await prisma.v2_bookings.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: "confirmed" },
        })
      }

      return Response.json({ message: "Verificação concluída" })
    } catch (error) {
      return Response.json({ error: "Erro ao verificar comprovante" }, { status: 500 })
    }
  },
)
