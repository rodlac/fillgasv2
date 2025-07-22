import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const PUT = withPermission("coupons:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const body = await req.json()

    try {
      const coupon = await prisma.v2_coupons.update({
        where: { id: params.id },
        data: body,
      })

      return Response.json(coupon)
    } catch (error) {
      return Response.json({ error: "Erro ao atualizar cupom" }, { status: 500 })
    }
  },
)

export const DELETE = withPermission("coupons:delete")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await prisma.v2_coupons.delete({
        where: { id: params.id },
      })

      return Response.json({ success: true })
    } catch (error) {
      return Response.json({ error: "Erro ao excluir cupom" }, { status: 500 })
    }
  },
)
