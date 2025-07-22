import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called from a Server Component or Route Handler.
          // This error is typically caused by an attempt to set a cookie from a Client Component.
          // Many of the Supabase client methods are Server Actions, and they often set cookies.
          // If you are calling these methods from a Client Component, make sure to wrap them in a Server Action.
          console.warn("Failed to set cookie from server client:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `cookies().delete()` method can only be called from a Server Component or Route Handler.
          // This error is typically caused by an attempt to delete a cookie from a Client Component.
          // Many of the Supabase client methods are Server Actions, and they often delete cookies.
          // If you are calling these methods from a Client Component, make sure to wrap them in a Server Action.
          console.warn("Failed to remove cookie from server client:", error)
        }
      },
    },
  })
}
