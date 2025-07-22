import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: "Código do cupom é obrigatório" }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    })

    if (!coupon) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "Cupom inativo" }, { status: 400 })
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: "Cupom expirado" }, { status: 400 })
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 })
    }

    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export const POST = withPermission(handler)
