import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export function withPermission(permission: string) {
  return (handler: (req: NextRequest, context?: any) => Promise<Response>) =>
    async (req: NextRequest, context?: any) => {
      try {
        const supabase = await createServerSupabaseClient()

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        // For now, we'll allow all authenticated users
        // In the future, you can implement role-based permissions here

        return handler(req, context)
      } catch (error) {
        console.error("Auth error:", error)
        return Response.json({ error: "Internal server error" }, { status: 500 })
      }
    }
}
