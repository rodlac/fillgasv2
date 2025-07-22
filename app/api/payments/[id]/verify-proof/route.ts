import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const PUT = withPermission(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  const { isVerified } = await req.json()

  if (typeof isVerified !== "boolean") {
    return NextResponse.json({ error: "isVerified is required and must be a boolean" }, { status: 400 })
  }

  try {
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        proofVerified: isVerified,
        paymentStatus: isVerified ? "paid" : "pending", // Update payment status based on verification
      },
    })
    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error verifying payment proof:", error)
    return NextResponse.json({ error: "Failed to verify payment proof" }, { status: 500 })
  }
}, "admin")
