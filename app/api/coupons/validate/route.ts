import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withPermission } from "@/lib/auth"

export const POST = withPermission(async (req: NextRequest) => {
  try {
    const { code, amount } = await req.json()

    if (!code || typeof amount !== "number") {
      return NextResponse.json({ error: "Code and amount are required" }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    })

    if (!coupon) {
      return NextResponse.json({ error: "Cupom inválido ou não encontrado." }, { status: 404 })
    }

    if (coupon.minimumAmount && amount < coupon.minimumAmount) {
      return NextResponse.json(
        { error: `Valor mínimo de R$ ${coupon.minimumAmount.toFixed(2)} para este cupom.` },
        { status: 400 },
      )
    }

    let discountValue = 0
    if (coupon.discountType === "fixed") {
      discountValue = coupon.discountValue
    } else if (coupon.discountType === "percentage") {
      discountValue = amount * (coupon.discountValue / 100)
    }

    // Ensure discount does not exceed the total amount
    discountValue = Math.min(discountValue, amount)

    return NextResponse.json({
      valid: true,
      coupon,
      discountAmount: discountValue,
      finalAmount: amount - discountValue,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Falha ao validar cupom." }, { status: 500 })
  }
}, "admin")
