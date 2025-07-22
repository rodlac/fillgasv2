import { createServerClient } from "@supabase/ssr"
import type { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createMiddlewareSupabaseClient = (req: NextRequest, res: NextResponse) => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        // Para o middleware, precisamos manipular os cookies diretamente no objeto de resposta
        req.cookies.set({ name, value, ...options }) // Define o cookie no objeto de requisição para uso posterior
        res.headers.append(
          "Set-Cookie",
          `${name}=${value}; Path=/; ${Object.entries(options)
            .map(([key, val]) => `${key}=${val}`)
            .join("; ")}`,
        )
      },
      remove(name: string, options: any) {
        req.cookies.set({ name, value: "", ...options })
        res.headers.append(
          "Set-Cookie",
          `${name}=; Path=/; Max-Age=0; ${Object.entries(options)
            .map(([key, val]) => `${key}=${val}`)
            .join("; ")}`,
        )
      },
    },
  })
}
