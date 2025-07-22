import type { NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@/lib/supabase-middleware"

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareSupabaseClient(request)

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is not signed in and the current path is not /login redirect the user to /login
  if (!user && !request.nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/login", request.url))
  }

  // If user is signed in and the current path is /login redirect the user to /dashboard
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
