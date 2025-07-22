import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("coupons:read")(async (req: NextRequest) => {
  try {
    const coupons = await prisma.v2_coupons.findMany({
      orderBy: { createdAt: "desc" },
    })
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
        code: body.code,
        name: body.name,
        discountType: body.discountType,
        discountValue: Number.parseFloat(body.discountValue),
        minimumAmount: body.minimumAmount ? Number.parseFloat(body.minimumAmount) : null,
        validFrom: new Date(body.validFrom),
        validUntil: new Date(body.validUntil),
        maxUsage: body.maxUsage ? Number.parseInt(body.maxUsage) : null,
        maxUsagePerUser: body.maxUsagePerUser ? Number.parseInt(body.maxUsagePerUser) : null,
        isActive: body.isActive,
      },
    })
    return NextResponse.json(newCoupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
})
