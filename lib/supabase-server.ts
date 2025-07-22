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
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called from a Server Component or Server Action.
          // This error can be ignored if you are processing a form on a Server Action and
          // cookies are not crucial to the successful completion of that action
          console.warn("Could not set cookie from Server Component/Action:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called from a Server Component or Server Action.
          // This error can be ignored if you are processing a form on a Server Action and
          // cookies are not crucial to the successful completion of that action
          console.warn("Could not remove cookie from Server Component/Action:", error)
        }
      },
    },
  })
}
