import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest) => {
  try {
    const coupons = await prisma.coupon.findMany()
    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}, "admin")

export const POST = withPermission(async (req: NextRequest) => {
  try {
    const data = await req.json()
    const newCoupon = await prisma.coupon.create({ data })
    return NextResponse.json(newCoupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}, "admin")
