import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    })
    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 })
    }
    // Ensure discountValue and minimumAmount are converted to numbers for frontend
    const formattedCoupon = {
      ...coupon,
      discountValue: coupon.discountValue.toNumber(),
      minimumAmount: coupon.minimumAmount?.toNumber(),
    }
    return NextResponse.json(formattedCoupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ message: "Failed to fetch coupon" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const updatedCoupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...data,
        discountValue: Number.parseFloat(data.discountValue),
        minimumAmount: data.minimumAmount ? Number.parseFloat(data.minimumAmount) : null,
      },
    })
    // Convert back to number for response
    const formattedCoupon = {
      ...updatedCoupon,
      discountValue: updatedCoupon.discountValue.toNumber(),
      minimumAmount: updatedCoupon.minimumAmount?.toNumber(),
    }
    return NextResponse.json(formattedCoupon)
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ message: "Failed to update coupon" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.coupon.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Coupon deleted" }, { status: 204 })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ message: "Failed to delete coupon" }, { status: 500 })
  }
}
