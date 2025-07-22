import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message)
    return NextResponse.json({ message: error.message }, { status: 401 })
  }

  return NextResponse.json({ message: "Login successful", user: data.user })
}
