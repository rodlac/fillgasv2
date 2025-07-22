import { PrismaClient } from "@prisma/client"

// add prisma to the NodeJS global type
declare global {
  var prismaGlobal: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as {
  prismaGlobal: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalForPrisma.prismaGlobal || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaGlobal = prisma

export default prisma
