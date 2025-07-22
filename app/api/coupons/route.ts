import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Changed to named import
import { withPermission } from "@/lib/auth"

export const GET = withPermission("coupons:read")(async () => {
  try {
    const coupons = await prisma.v2_coupons.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
})

export const POST = withPermission("coupons:create")(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { code, name, discountType, discountValue, minimumAmount, usageLimit, expiresAt, isActive } = body

    if (!code || !name || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Code, name, discountType, and discountValue are required" }, { status: 400 })
    }

    const newCoupon = await prisma.v2_coupons.create({
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

    return NextResponse.json(newCoupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
})
