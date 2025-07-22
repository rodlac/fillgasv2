import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany()
    // Ensure discountValue and minimumAmount are converted to numbers for frontend
    const formattedCoupons = coupons.map((coupon) => ({
      ...coupon,
      discountValue: coupon.discountValue.toNumber(),
      minimumAmount: coupon.minimumAmount?.toNumber(),
    }))
    return NextResponse.json(formattedCoupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ message: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newCoupon = await prisma.coupon.create({
      data: {
        ...data,
        discountValue: Number.parseFloat(data.discountValue),
        minimumAmount: data.minimumAmount ? Number.parseFloat(data.minimumAmount) : null,
      },
    })
    // Convert back to number for response
    const formattedCoupon = {
      ...newCoupon,
      discountValue: newCoupon.discountValue.toNumber(),
      minimumAmount: newCoupon.minimumAmount?.toNumber(),
    }
    return NextResponse.json(formattedCoupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ message: "Failed to create coupon" }, { status: 500 })
  }
}
