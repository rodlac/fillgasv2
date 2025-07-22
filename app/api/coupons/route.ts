import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest) => {
  try {
    const coupons = await prisma.v2_coupons.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedCoupons = coupons.map((coupon) => ({
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minimumAmount: coupon.minimumAmount ? Number(coupon.minimumAmount) : null,
    }))

    return NextResponse.json(formattedCoupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
})

export const POST = withPermission(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { code, discountType, discountValue, minimumAmount, expiresAt, isActive } = body

    const newCoupon = await prisma.v2_coupons.create({
      data: {
        code,
        discountType,
        discountValue: Number.parseFloat(discountValue.toString()),
        minimumAmount: minimumAmount ? Number.parseFloat(minimumAmount.toString()) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
      },
    })

    const formattedCoupon = {
      ...newCoupon,
      discountValue: Number(newCoupon.discountValue),
      minimumAmount: newCoupon.minimumAmount ? Number(newCoupon.minimumAmount) : null,
    }

    return NextResponse.json(formattedCoupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
})
