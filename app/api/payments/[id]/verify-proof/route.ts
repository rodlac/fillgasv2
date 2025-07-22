import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { status, verificationNotes } = body

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 })
    }

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
