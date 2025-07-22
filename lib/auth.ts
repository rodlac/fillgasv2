import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { NextResponse, type NextRequest } from "next/server"

// Define a type for the handler function
type Handler = (req: NextRequest, ...args: any[]) => Promise<NextResponse | Response>

// This is a placeholder for actual permission checking logic
// In a real application, you would check user roles/permissions from the session
const checkPermission = async (session: any, requiredPermission: string) => {
  if (!session) {
    return false // No session, no permission
  }
  // Example: Check if user has an 'admin' role or specific permission
  // This would involve fetching user roles/permissions from your database
  // For now, let's assume all authenticated users have all permissions for simplicity
  return true
}

export const withPermission =
  (requiredPermission: string) =>
  (handler: Handler) =>
  async (req: NextRequest, ...args: any[]) => {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasPermission = await checkPermission(session, requiredPermission)

    if (!hasPermission) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    return handler(req, ...args)
  }

export async function getSession() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}
