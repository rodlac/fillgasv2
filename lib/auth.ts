import { createServerClient } from "./supabase"
import { prisma } from "./prisma"
import type { NextRequest } from "next/server"

export async function getCurrentUser(req?: NextRequest) {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return null
  }

  // Get user from our database
  const user = await prisma.v2_users.findUnique({
    where: { email: session.user.email! },
  })

  return user
}

export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const user = await prisma.v2_users.findUnique({
    where: { id: userId },
  })

  if (!user || !user.isActive) {
    return false
  }

  // Check user permissions
  const permissions = (user.permissions as string[]) || []

  // Admin has all permissions
  if (permissions.includes("*") || user.role === "admin") {
    return true
  }

  return permissions.includes(permission)
}

export function withAuth(handler: Function) {
  return async (req: NextRequest, context: any) => {
    const user = await getCurrentUser(req)

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    return handler(req, context, user)
  }
}

export function withPermission(permission: string) {
  return (handler: Function) =>
    withAuth(async (req: NextRequest, context: any, user: any) => {
      const hasPermission = await checkPermission(user.id, permission)

      if (!hasPermission) {
        return Response.json({ error: "Forbidden" }, { status: 403 })
      }

      return handler(req, context, user)
    })
}
