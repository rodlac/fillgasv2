import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("coupons:read")(async (req: NextRequest) => {
  const coupons = await prisma.v2_coupons.findMany({
    orderBy: { createdAt: "desc" },
  })

  return Response.json(coupons)
})

export const POST = withPermission("coupons:create")(async (req: NextRequest) => {
  const body = await req.json()

  try {
    const coupon = await prisma.v2_coupons.create({
      data: body,
    })

    return Response.json(coupon, { status: 201 })
  } catch (error) {
    return Response.json({ error: "Erro ao criar cupom" }, { status: 500 })
  }
})
