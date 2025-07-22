import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export async function POST(request: NextRequest) {
  return withPermission(async () => {
    try {
      const { code, clientId, orderAmount } = await request.json()

      if (!code || !clientId || orderAmount === undefined) {
        return NextResponse.json(
          {
            isValid: false,
            reason: "Código do cupom, cliente e valor do pedido são obrigatórios.",
          },
          { status: 400 },
        )
      }

      // Find the coupon
      const coupon = await prisma.coupon.findUnique({
        where: { code },
      })

      if (!coupon) {
        return NextResponse.json({
          isValid: false,
          reason: "Cupom não encontrado.",
        })
      }

      // Check if coupon is active
      if (!coupon.isActive) {
        return NextResponse.json({
          isValid: false,
          reason: "Cupom inativo.",
        })
      }

      // Check expiration date
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return NextResponse.json({
          isValid: false,
          reason: "Cupom expirado.",
        })
      }

      // Check usage limit
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({
          isValid: false,
          reason: "Limite de uso do cupom atingido.",
        })
      }

      // Check minimum amount
      if (coupon.minimumAmount !== null && orderAmount < coupon.minimumAmount) {
        return NextResponse.json({
          isValid: false,
          reason: `Valor mínimo do pedido deve ser R$ ${coupon.minimumAmount.toFixed(2)}.`,
        })
      }

      // Check if client has already used this coupon (if it's single-use per client)
      const existingUsage = await prisma.booking.findFirst({
        where: {
          clientId,
          couponId: coupon.id,
        },
      })

      if (existingUsage && coupon.usageLimit === 1) {
        return NextResponse.json({
          isValid: false,
          reason: "Este cupom já foi utilizado por este cliente.",
        })
      }

      // Calculate discount
      let discountAmount = 0
      if (coupon.discountType === "percentage") {
        discountAmount = (orderAmount * coupon.discountValue) / 100
      } else {
        discountAmount = coupon.discountValue
      }

      // Ensure discount doesn't exceed order amount
      discountAmount = Math.min(discountAmount, orderAmount)

      return NextResponse.json({
        isValid: true,
        discountAmount,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
        },
      })
    } catch (error) {
      console.error("Error validating coupon:", error)
      return NextResponse.json(
        {
          isValid: false,
          reason: "Erro interno do servidor.",
        },
        { status: 500 },
      )
    }
  })
}
