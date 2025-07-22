import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("payments:read")(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  const where = status ? { status } : {}

  const [payments, total] = await Promise.all([
    prisma.v2_payments.findMany({
      where,
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.v2_payments.count({ where }),
  ])

  return Response.json({ payments, total })
})
