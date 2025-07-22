import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    })

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 })
    }

    const formattedCoupon = {
      ...coupon,
      discountValue: coupon.discountValue.toNumber(),
      minimumAmount: coupon.minimumAmount?.toNumber() || null,
    }

    return NextResponse.json(formattedCoupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ message: "Failed to fetch coupon" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    const { code, discountType, discountValue, minimumAmount, maxUsage, validFrom, validUntil, isActive } = body

    if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        discountType,
        discountValue: Number.parseFloat(discountValue),
        minimumAmount: minimumAmount ? Number.parseFloat(minimumAmount) : null,
        maxUsage: maxUsage ? Number.parseInt(maxUsage) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: isActive ?? undefined,
      },
    })
    return NextResponse.json(updatedCoupon)
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ message: "Failed to update coupon" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await prisma.coupon.delete({
      where: { id },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ message: "Failed to delete coupon" }, { status: 500 })
  }
}
