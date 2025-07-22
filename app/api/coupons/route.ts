import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    })
    // Convert Decimal to number for frontend consumption
    const formattedCoupons = coupons.map((coupon) => ({
      ...coupon,
      discountValue: coupon.discountValue.toNumber(),
      minimumAmount: coupon.minimumAmount?.toNumber() || null, // Handle optional minimumAmount
    }))
    return NextResponse.json(formattedCoupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ message: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, discountType, discountValue, minimumAmount, maxUsage, validFrom, validUntil, isActive } = body

    if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue: Number.parseFloat(discountValue),
        minimumAmount: minimumAmount ? Number.parseFloat(minimumAmount) : null,
        maxUsage: maxUsage ? Number.parseInt(maxUsage) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: isActive ?? true,
        currentUsage: 0,
      },
    })
    return NextResponse.json(newCoupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ message: "Failed to create coupon" }, { status: 500 })
  }
}
