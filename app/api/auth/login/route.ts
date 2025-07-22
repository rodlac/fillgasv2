import { NextResponse } from "next/server"
import { createClientServer } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const supabase = createClientServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: "Login successful" })
}
