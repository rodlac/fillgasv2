import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const POST = withPermission("coupons:read")(async (req: NextRequest) => {
  try {
    const { code, clientId, orderAmount } = await req.json()

    if (!code || !clientId || orderAmount === undefined) {
      return NextResponse.json(
        { isValid: false, reason: "Código do cupom, ID do cliente e valor do pedido são obrigatórios" },
        { status: 400 },
      )
    }

    // Find the coupon
    const coupon = await prisma.v2_coupons.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json({ isValid: false, reason: "Cupom não encontrado" })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ isValid: false, reason: "Cupom inativo" })
    }

    const now = new Date()
    if (now < coupon.validFrom) {
      return NextResponse.json({ isValid: false, reason: "Cupom ainda não é válido" })
    }

    if (now > coupon.validUntil) {
      return NextResponse.json({ isValid: false, reason: "Cupom expirado" })
    }

    // Check minimum amount
    if (coupon.minimumAmount && Number(orderAmount) < Number(coupon.minimumAmount)) {
      return NextResponse.json({
        isValid: false,
        reason: `Valor mínimo do pedido deve ser R$ ${Number(coupon.minimumAmount).toFixed(2)}`,
      })
    }

    // Check max usage
    if (coupon.maxUsage && coupon.currentUsage >= coupon.maxUsage) {
      return NextResponse.json({ isValid: false, reason: "Cupom esgotado" })
    }

    // Check max usage per user
    if (coupon.maxUsagePerUser) {
      const userUsageCount = await prisma.v2_couponUsages.count({
        where: {
          couponId: coupon.id,
          clientId: clientId,
        },
      })

      if (userUsageCount >= coupon.maxUsagePerUser) {
        return NextResponse.json({ isValid: false, reason: "Limite de uso por cliente atingido" })
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === "percentage") {
      discountAmount = (Number(orderAmount) * Number(coupon.discountValue)) / 100
    } else {
      discountAmount = Number(coupon.discountValue)
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, Number(orderAmount))

    return NextResponse.json({
      isValid: true,
      discountAmount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
      },
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ isValid: false, reason: "Erro interno do servidor" }, { status: 500 })
  }
})
