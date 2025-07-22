"use client"

import { Home, Users, Package, Calendar, DollarSign, Percent, Key, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      })
    } else {
      router.push("/login")
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Serviços", href: "/services", icon: Package },
    { name: "Agendamentos", href: "/bookings", icon: Calendar },
    { name: "Pagamentos", href: "/payments", icon: DollarSign },
    { name: "Cupons", href: "/coupons", icon: Percent },
    { name: "Usuários", href: "/users", icon: Users },
    { name: "API Keys", href: "/api-keys", icon: Key },
    { name: "Configurações", href: "/settings", icon: Settings },
  ]

  return (
    <div className="hidden lg:block fixed inset-y-0 left-0 z-10 w-64 border-r bg-background">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">FillGás</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-3" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
