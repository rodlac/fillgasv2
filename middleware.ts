import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@/lib/supabase-middleware" // Updated import

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient(req, res)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Allow access to login page and API routes without authentication
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return res
  }

  // Redirect to login if no session
  if (!session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (e.g. /public/placeholder.svg)
     * - All routes under /api/auth (handled separately)
     * - The login page itself
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth|login).*)",
  ],
}
