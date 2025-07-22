import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const POST = withPermission(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { code, amount } = body

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    const coupon = await prisma.v2_coupons.findUnique({
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

    const orderAmount = Number(amount || 0)
    const minimumAmount = coupon.minimumAmount ? Number(coupon.minimumAmount) : 0

    if (minimumAmount > 0 && orderAmount < minimumAmount) {
      return NextResponse.json(
        { error: `Valor mínimo para este cupom é R$ ${minimumAmount.toFixed(2)}` },
        { status: 400 },
      )
    }

    let discountAmount = 0
    const discountValue = Number(coupon.discountValue)

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (orderAmount * discountValue) / 100
    } else {
      discountAmount = discountValue
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: discountValue,
        minimumAmount: minimumAmount,
      },
      discountAmount,
      finalAmount: orderAmount - discountAmount,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
})
