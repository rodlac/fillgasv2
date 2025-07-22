import { PrismaClient } from "@prisma/client"

// add prisma to the NodeJS global type
declare global {
  var prismaGlobal: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma = global.prismaGlobal || new PrismaClient()

if (process.env.NODE_ENV === "development") global.prismaGlobal = prisma

export default prisma
