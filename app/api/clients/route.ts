import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { cpfCnpj: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.client.count({ where }),
    ])
    return NextResponse.json({ clients, total })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ message: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, cpfCnpj, address, isActive } = body

    if (!name || !email || !phone) {
      return NextResponse.json({ message: "Name, email, and phone are required" }, { status: 400 })
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        cpfCnpj,
        address,
        isActive: isActive ?? true,
      },
    })
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ message: "Failed to create client" }, { status: 500 })
  }
}
