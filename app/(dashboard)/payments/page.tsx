"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: string
  bookingId: string
  booking: {
    client: {
      name: string
    }
  }
  amount: number
  discountAmount?: number
  finalAmount: number
  paymentMethod: string
  status: string
  transactionId?: string
  proofOfPaymentUrl?: string
  verificationNotes?: string
  createdAt: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("") // For future filtering by client name/booking ID
  const { toast } = useToast()

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/payments?search=${search}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPayments(data.payments || []) // Ensure it's always an array
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar pagamentos",
        variant: "destructive",
      })
      setPayments([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [search])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
      case "awaiting_transfer":
        return "secondary"
      case "failed":
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-gray-600">Visualize e acompanhe todas as transações financeiras</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por cliente ou agendamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agendamento ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor Original</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Valor Final</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.bookingId.substring(0, 8)}...</TableCell>
                  <TableCell>{payment.booking.client.name}</TableCell>
                  <TableCell>R$ {Number(payment.amount).toFixed(2)}</TableCell>
                  <TableCell>R$ {Number(payment.discountAmount || 0).toFixed(2)}</TableCell>
                  <TableCell>R$ {Number(payment.finalAmount).toFixed(2)}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {payment.proofOfPaymentUrl && payment.status === "awaiting_transfer" && (
                      <Button variant="outline" size="sm" className="mr-2 bg-transparent">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {payment.transactionId && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://www.asaas.com/transactions/${payment.transactionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Search className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {payment.proofOfPaymentUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={payment.proofOfPaymentUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
