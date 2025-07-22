import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function getUser() {
  const cookieStore = cookies()

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return null
    }
    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export function withPermission(permission: string) {
  return <T extends any[]>(handler: (req: NextRequest, ...args: T) => Promise<NextResponse>) =>
    async (req: NextRequest, ...args: T): Promise<NextResponse> => {
      try {
        const user = await getUser()

        if (!user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // For now, we'll allow all authenticated users
        // In the future, you can implement role-based permissions here

        return handler(req, ...args)
      } catch (error) {
        console.error("Permission check error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
      }
    }
}
