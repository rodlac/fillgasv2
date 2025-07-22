import { NextResponse, type NextRequest } from "next/server"
import { createClientMiddleware } from "@/lib/supabase-middleware"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createClientMiddleware(request, response)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Allow access to login page and API routes without authentication
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return response
  }

  // Redirect unauthenticated users to login page
  if (!session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirectedFrom", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated, allow access
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (e.g. /public/images)
     * - Any files in the root (e.g. /robots.txt)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
