import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth" // Named import

export const POST = withPermission("bookings:create")(async (req: NextRequest) => {
  const body = await req.json()
  const { code, clientId, orderAmount } = body

  try {
    const coupon = await prisma.v2_coupons.findUnique({
      where: { code },
    })

    if (!coupon) {
      return Response.json({ isValid: false, reason: "Cupom não encontrado" })
    }

    if (!coupon.isActive) {
      return Response.json({ isValid: false, reason: "Cupom inativo" })
    }

    const now = new Date()
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return Response.json({ isValid: false, reason: "Cupom expirado" })
    }

    if (coupon.minimumAmount && orderAmount < Number(coupon.minimumAmount)) {
      return Response.json({
        isValid: false,
        reason: `Valor mínimo de R$ ${Number(coupon.minimumAmount).toFixed(2)} não atingido`,
      })
    }

    if (coupon.maxUsage && coupon.currentUsage >= coupon.maxUsage) {
      return Response.json({ isValid: false, reason: "Limite de uso atingido" })
    }

    // Check per-user usage
    if (coupon.maxUsagePerUser) {
      const userUsage = await prisma.v2_couponUsages.count({
        where: {
          couponId: coupon.id,
          clientId,
        },
      })

      if (userUsage >= coupon.maxUsagePerUser) {
        return Response.json({
          isValid: false,
          reason: "Limite de uso por cliente atingido",
        })
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * Number(coupon.discountValue)) / 100
    } else {
      discountAmount = Number(coupon.discountValue)
    }

    return Response.json({
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
    return Response.json({ error: "Erro ao validar cupom" }, { status: 500 })
  }
})
