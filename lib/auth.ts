import { createServerSupabaseClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export function withPermission(handler: (req: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    try {
      const supabase = createServerSupabaseClient()

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      return handler(req, context)
    } catch (error) {
      console.error("Auth error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
