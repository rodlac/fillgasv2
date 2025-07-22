import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
  })
}

export function createSupabaseReqResClient(req: Request) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        const cookie = req.headers.get("cookie")
        if (!cookie) return undefined
        const match = cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
        return match ? match[2] : undefined
      },
      set() {
        // Not implemented for request/response pattern
      },
      remove() {
        // Not implemented for request/response pattern
      },
    },
  })
}
