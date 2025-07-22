"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  TagIcon,
  DollarSignIcon,
  ReceiptIcon,
  KeyIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface SidebarProps {
  onClose?: () => void // Optional prop for mobile close button
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: HomeIcon, label: "Dashboard" },
    { href: "/clients", icon: UsersIcon, label: "Clientes" },
    { href: "/services", icon: ShoppingCartIcon, label: "Serviços" },
    { href: "/bookings", icon: TagIcon, label: "Agendamentos" },
    { href: "/coupons", icon: DollarSignIcon, label: "Cupons" },
    { href: "/payments", icon: ReceiptIcon, label: "Pagamentos" },
    { href: "/payment-verification", icon: ReceiptIcon, label: "Verificação Pag." }, // Placeholder for future page
    { href: "/users", icon: UsersIcon, label: "Usuários" }, // Placeholder for future page
    { href: "/api-keys", icon: KeyIcon, label: "Chaves API" }, // Placeholder for future page
    { href: "/settings", icon: SettingsIcon, label: "Configurações" }, // Placeholder for future page
  ]

  return (
    <div className="flex h-full flex-col border-r bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
          <Image src="/placeholder-logo.svg" alt="FillGás Logo" width={32} height={32} />
          <span className="text-lg">FillGás</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <XIcon className="h-6 w-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid items-start gap-2 px-4 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900 ${
                    isActive ? "bg-gray-100 text-gray-900" : "text-gray-500"
                  }`}
                  href={item.href}
                  onClick={onClose} // Close sidebar on mobile when item is clicked
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
