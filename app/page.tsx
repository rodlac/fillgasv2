import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase" // Importe o cliente Supabase do lado do servidor

export default async function HomePage() {
  const supabase = createClient() // Crie uma instância do cliente Supabase para o servidor

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }

  return null // Este componente não renderiza nada, apenas redireciona
}
