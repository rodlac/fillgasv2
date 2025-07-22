import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("clients:read")(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const client = await prisma.v2_clients.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!client) {
    return Response.json({ error: "Cliente não encontrado" }, { status: 404 })
  }

  return Response.json(client)
})

export const PUT = withPermission("clients:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const body = await req.json()

    try {
      const client = await prisma.v2_clients.update({
        where: { id: params.id },
        data: body,
      })

      return Response.json(client)
    } catch (error) {
      return Response.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
    }
  },
)

export const DELETE = withPermission("clients:delete")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await prisma.v2_clients.update({
        where: { id: params.id },
        data: { isActive: false },
      })

      return new Response(null, { status: 204 })
    } catch (error) {
      return Response.json({ error: "Erro ao desativar cliente" }, { status: 500 })
    }
  },
)
