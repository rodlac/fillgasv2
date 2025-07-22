import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status, verificationNotes } = await request.json()
    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: { status, verificationNotes },
    })
    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error verifying payment proof:", error)
    return NextResponse.json({ message: "Failed to verify payment proof" }, { status: 500 })
  }
}
