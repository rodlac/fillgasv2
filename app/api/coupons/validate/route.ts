import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const POST = withPermission("coupons:validate")(async (req: NextRequest) => {
  try {
    const { code, clientId, orderAmount } = await req.json()

    if (!code || !clientId || orderAmount === undefined) {
      return NextResponse.json(
        { isValid: false, reason: "Código do cupom, cliente e valor do pedido são obrigatórios." },
        { status: 400 },
      )
    }

    // Find the coupon
    const coupon = await prisma.v2_coupons.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    })

    if (!coupon) {
      return NextResponse.json({
        isValid: false,
        reason: "Cupom não encontrado ou expirado.",
      })
    }

    // Check if coupon has usage limit
    if (coupon.usageLimit !== null) {
      const usageCount = await prisma.v2_bookings.count({
        where: { couponId: coupon.id },
      })

      if (usageCount >= coupon.usageLimit) {
        return NextResponse.json({
          isValid: false,
          reason: "Cupom atingiu o limite de uso.",
        })
      }
    }

    // Check minimum amount
    if (coupon.minimumAmount && orderAmount < Number(coupon.minimumAmount)) {
      return NextResponse.json({
        isValid: false,
        reason: `Valor mínimo do pedido deve ser R$ ${Number(coupon.minimumAmount).toFixed(2)}.`,
      })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * Number(coupon.discountValue)) / 100
    } else {
      discountAmount = Number(coupon.discountValue)
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
    return NextResponse.json({ isValid: false, reason: "Erro interno do servidor." }, { status: 500 })
  }
})
