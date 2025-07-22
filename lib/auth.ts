import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

type Role = "admin" | "user" // Example roles

export function withPermission(handler: Function, requiredRole: Role) {
  return async (req: NextRequest, ...args: any[]) => {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real application, you would fetch the user's role from your database
    // For demonstration, let's assume a simple check or fetch from user metadata
    // const { data: profile, error: profileError } = await supabase
    //   .from('profiles')
    //   .select('role')
    //   .eq('id', user.id)
    //   .single();

    // if (profileError || !profile || profile.role !== requiredRole) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // For now, let's assume all authenticated users are 'admin' for simplicity
    // You should replace this with actual role management
    if (requiredRole === "admin") {
      // If the user is authenticated, we'll allow them for now.
      // Implement actual role checking here.
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return handler(req, ...args)
  }
}
