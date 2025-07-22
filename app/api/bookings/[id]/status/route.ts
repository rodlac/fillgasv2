import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const PATCH = withPermission("bookings:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const body = await req.json()
    const { status } = body

    try {
      const booking = await prisma.v2_bookings.update({
        where: { id: params.id },
        data: { status },
      })

      return Response.json(booking)
    } catch (error) {
      return Response.json({ error: "Erro ao atualizar status" }, { status: 500 })
    }
  },
)
