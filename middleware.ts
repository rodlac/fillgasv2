import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@/lib/supabase-middleware"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient(request, response)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Allow access to login page without authentication
  if (pathname === "/login") {
    if (session) {
      // If already logged in, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return response
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") || pathname === "/") {
    if (!session) {
      // If not logged in, redirect to login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
}
