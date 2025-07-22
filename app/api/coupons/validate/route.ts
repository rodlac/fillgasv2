import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    })

    if (!coupon) {
      return NextResponse.json({ isValid: false, message: "Coupon not found" })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ isValid: false, message: "Coupon is inactive" })
    }

    if (coupon.expirationDate && new Date() > coupon.expirationDate) {
      return NextResponse.json({ isValid: false, message: "Coupon has expired" })
    }

    return NextResponse.json({ isValid: true, coupon })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
