import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Changed to named import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("coupons:read")(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const coupon = await prisma.v2_coupons.findUnique({
      where: { id: params.id },
    })

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 })
  }
})

export const PUT = withPermission("coupons:update")(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json()
      const { code, name, discountType, discountValue, minimumAmount, usageLimit, expiresAt, isActive } = body

      if (!code || !name || !discountType || discountValue === undefined) {
        return NextResponse.json({ error: "Code, name, discountType, and discountValue are required" }, { status: 400 })
      }

      const updatedCoupon = await prisma.v2_coupons.update({
        where: { id: params.id },
        data: {
          code,
          name,
          discountType,
          discountValue: Number.parseFloat(discountValue.toString()),
          minimumAmount: minimumAmount ? Number.parseFloat(minimumAmount.toString()) : null,
          usageLimit: usageLimit ? Number.parseInt(usageLimit.toString()) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isActive: isActive ?? true,
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

      return NextResponse.json({ message: "Coupon deleted successfully" })
    } catch (error) {
      console.error("Error deleting coupon:", error)
      return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
    }
  },
)
