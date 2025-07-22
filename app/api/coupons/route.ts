import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission("coupons:read")(async (req: NextRequest) => {
  try {
    const coupons = await prisma.v2_coupons.findMany()
    return NextResponse.json(
      coupons.map((coupon) => ({
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minimumAmount: coupon.minimumAmount ? Number(coupon.minimumAmount) : null,
      })),
    )
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
})

export const POST = withPermission("coupons:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const newCoupon = await prisma.v2_coupons.create({
      data: {
        ...body,
        discountValue: Number.parseFloat(body.discountValue.toString()),
        minimumAmount: body.minimumAmount ? Number.parseFloat(body.minimumAmount.toString()) : null,
      },
    })
    return NextResponse.json(
      {
        ...newCoupon,
        discountValue: Number(newCoupon.discountValue),
        minimumAmount: newCoupon.minimumAmount ? Number(newCoupon.minimumAmount) : null,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
})
