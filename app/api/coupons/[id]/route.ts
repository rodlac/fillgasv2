import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const coupon = await prisma.v2_coupons.findUnique({
      where: { id: params.id },
    })

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    const formattedCoupon = {
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minimumAmount: coupon.minimumAmount ? Number(coupon.minimumAmount) : null,
    }

    return NextResponse.json(formattedCoupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 })
  }
})

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    const { code, discountType, discountValue, minimumAmount, expiresAt, isActive } = body

    const updatedCoupon = await prisma.v2_coupons.update({
      where: { id: params.id },
      data: {
        code,
        discountType,
        discountValue: Number.parseFloat(discountValue.toString()),
        minimumAmount: minimumAmount ? Number.parseFloat(minimumAmount.toString()) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
      },
    })

    const formattedCoupon = {
      ...updatedCoupon,
      discountValue: Number(updatedCoupon.discountValue),
      minimumAmount: updatedCoupon.minimumAmount ? Number(updatedCoupon.minimumAmount) : null,
    }

    return NextResponse.json(formattedCoupon)
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
})

export const DELETE = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.v2_coupons.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
})
