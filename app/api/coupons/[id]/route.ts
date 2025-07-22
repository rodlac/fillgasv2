import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const GET = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    const coupon = await prisma.coupon.findUnique({ where: { id } })
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }
    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 })
  }
}, "admin")

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    const data = await req.json()
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data,
    })
    return NextResponse.json(updatedCoupon)
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}, "admin")

export const DELETE = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  try {
    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ message: "Coupon deleted successfully" }, { status: 204 })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}, "admin")
