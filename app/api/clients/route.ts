import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("clients:read")(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }
    : {}

  const [clients, total] = await Promise.all([
    prisma.v2_clients.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.v2_clients.count({ where }),
  ])

  return Response.json({ clients, total })
})

export const POST = withPermission("clients:create")(async (req: NextRequest) => {
  const body = await req.json()
  const { name, email, cpf, phone, address, postalCode, cylinderType } = body

  // Check if CPF already exists
  const existingClient = await prisma.v2_clients.findUnique({
    where: { cpf },
  })

  if (existingClient) {
    return Response.json({ error: "CPF já cadastrado" }, { status: 400 })
  }

  try {
    const client = await prisma.v2_clients.create({
      data: {
        name,
        email,
        cpf,
        phone,
        address,
        postalCode,
        cylinderType,
      },
    })

    return Response.json(client, { status: 201 })
  } catch (error) {
    return Response.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
})
