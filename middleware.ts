import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@/lib/supabase"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient(req, res)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/bookings") ||
    req.nextUrl.pathname.startsWith("/clients") ||
    req.nextUrl.pathname.startsWith("/services") ||
    req.nextUrl.pathname.startsWith("/coupons") ||
    req.nextUrl.pathname.startsWith("/payments") ||
    req.nextUrl.pathname.startsWith("/users") ||
    req.nextUrl.pathname.startsWith("/api-keys") ||
    req.nextUrl.pathname.startsWith("/settings")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Redirect authenticated users away from login
  if (req.nextUrl.pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
