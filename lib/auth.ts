import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// This is a simplified version. In a real app, you'd fetch user roles/permissions.
// For now, it just ensures a session exists.
export function withPermission(permission: string) {
  return (handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse>) => {
    return async (req: NextRequest, context: { params: any }) => {
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server-side operations
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.set({ name, value: "", ...options })
            },
          },
        },
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // In a real application, you would check if the user has the 'permission'
      // For example: if (!user.permissions.includes(permission)) { ... }
      console.log(`User ${user.id} attempting action with permission: ${permission}`)

      return handler(req, context)
    }
  }
}
