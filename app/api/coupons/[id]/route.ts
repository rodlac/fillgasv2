import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Changed to default import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("coupons:read")(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const coupon = await prisma.v2_coupons.findUnique({
      where: { id: params.id },
    })
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minimumAmount: coupon.minimumAmount ? Number(coupon.minimumAmount) : null,
    })
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 })
  }
})

export const PUT = withPermission("coupons:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()
      const updatedCoupon = await prisma.v2_coupons.update({
        where: { id: params.id },
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
      return NextResponse.json(updatedCoupon)
    } catch (error) {
      console.error("Error updating coupon:", error)
      return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
    }
  },
)

export const DELETE = withPermission("coupons:delete")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await prisma.v2_coupons.delete({
        where: { id: params.id },
      })
      return new Response(null, { status: 204 })
    } catch (error) {
      console.error("Error deleting coupon:", error)
      return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
    }
  },
)
