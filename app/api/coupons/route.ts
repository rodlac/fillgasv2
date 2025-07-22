import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany()
    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { code, discountType, value, expirationDate, isActive } = await request.json()

    const newCoupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        value,
        expirationDate: new Date(expirationDate),
        isActive,
      },
    })

    return NextResponse.json(newCoupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
