import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("services:read")(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const isActive = searchParams.get("isActive")

  const where = isActive !== null ? { isActive: isActive === "true" } : {}

  const services = await prisma.v2_services.findMany({
    where,
    orderBy: { name: "asc" },
  })

  return Response.json(services)
})

export const POST = withPermission("services:create")(async (req: NextRequest) => {
  const body = await req.json()
  const { name, price, isActive = true } = body

  try {
    const service = await prisma.v2_services.create({
      data: {
        name,
        price,
        isActive,
      },
    })

    return Response.json(service, { status: 201 })
  } catch (error) {
    return Response.json({ error: "Erro ao criar serviço" }, { status: 500 })
  }
})
