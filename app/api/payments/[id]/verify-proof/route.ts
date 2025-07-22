import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { proofUrl } = await request.json()

    if (!proofUrl) {
      return NextResponse.json({ error: "Proof URL is required" }, { status: 400 })
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { proofUrl, status: "PENDING_VERIFICATION" }, // Ou outro status apropriado
    })

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error verifying payment proof:", error)
    return NextResponse.json({ error: "Failed to verify payment proof" }, { status: 500 })
  }
}
