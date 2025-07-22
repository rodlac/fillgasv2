import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const PUT = withPermission("services:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const body = await req.json()

    try {
      const service = await prisma.v2_services.update({
        where: { id: params.id },
        data: body,
      })

      return Response.json(service)
    } catch (error) {
      return Response.json({ error: "Erro ao atualizar serviço" }, { status: 500 })
    }
  },
)
