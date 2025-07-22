import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const POST = withPermission("coupons:read")(async (req: NextRequest) => {
  try {
    const { code, amount } = await req.json()

    if (!code || !amount) {
      return NextResponse.json({ error: "Coupon code and amount are required" }, { status: 400 })
    }

    const coupon = await prisma.v2_coupons.findUnique({
      where: { code },
    })

    if (!coupon || coupon.isActive === false) {
      return NextResponse.json({ isValid: false, message: "Invalid or inactive coupon" }, { status: 404 })
    }

    const now = new Date()
    if (coupon.validFrom && now < coupon.validFrom) {
      return NextResponse.json({ isValid: false, message: "Coupon not yet active" }, { status: 400 })
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return NextResponse.json({ isValid: false, message: "Coupon expired" }, { status: 400 })
    }

    if (coupon.minimumAmount && Number(amount) < Number(coupon.minimumAmount)) {
      return NextResponse.json(
        { isValid: false, message: `Minimum amount of R$${Number(coupon.minimumAmount).toFixed(2)} not met` },
        { status: 400 },
      )
    }

    const discountAmount = Number(coupon.discountValue)
    const finalAmount = Number(amount) - discountAmount

    return NextResponse.json({
      isValid: true,
      coupon: {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minimumAmount: coupon.minimumAmount ? Number(coupon.minimumAmount) : null,
      },
      discountAmount,
      finalAmount: Math.max(0, finalAmount), // Ensure final amount is not negative
      message: "Coupon applied successfully!",
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
})
