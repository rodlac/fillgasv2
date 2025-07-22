"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, DollarSign, Package } from "lucide-react"

interface DashboardStats {
  todayBookings: number
  pendingPayments: number
  weeklyRevenue: number
  activeClients: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    pendingPayments: 0,
    weeklyRevenue: 0,
    activeClients: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // This would be replaced with actual API calls
        setStats({
          todayBookings: 12,
          pendingPayments: 5,
          weeklyRevenue: 2450.0,
          activeClients: 156,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-xs text-muted-foreground">+2 desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Semanal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.weeklyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+12% em relação à semana passada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">+8 novos este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as funcionalidades mais usadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Users className="mr-2 h-4 w-4" />
              Cadastrar Cliente
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Package className="mr-2 h-4 w-4" />
              Gerenciar Serviços
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entregas de Hoje</CardTitle>
            <CardDescription>Agendamentos para entrega hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">João Silva</p>
                  <p className="text-sm text-gray-600">Rua das Flores, 123</p>
                </div>
                <Button size="sm">Confirmar</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maria Santos</p>
                  <p className="text-sm text-gray-600">Av. Principal, 456</p>
                </div>
                <Button size="sm">Confirmar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
