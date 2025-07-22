"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, Users, Package, Ticket, CreditCard, FileCheck, Settings, Key, LayoutDashboard } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agendamentos", href: "/bookings", icon: Calendar },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Serviços", href: "/services", icon: Package },
  { name: "Cupons", href: "/coupons", icon: Ticket },
  { name: "Pagamentos", href: "/payments", icon: CreditCard },
  { name: "Verificação", href: "/payment-verification", icon: FileCheck },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Configurações", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-primary">FillGás</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? "bg-gray-50 text-primary"
                          : "text-gray-700 hover:text-primary hover:bg-gray-50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                      )}
                    >
                      <item.icon
                        className={cn(
                          pathname === item.href ? "text-primary" : "text-gray-400 group-hover:text-primary",
                          "h-6 w-6 shrink-0",
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
