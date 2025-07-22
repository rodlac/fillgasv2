"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: string
  bookingId: string
  booking: {
    client: { name: string }
  }
  amount: number
  discountAmount?: number
  finalAmount: number
  paymentMethod: string
  status: string
  transactionId?: string
  proofOfPaymentUrl?: string
  createdAt: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      const data = await response.json()
      setPayments(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pagamentos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default"
      case "PENDING":
        return "secondary"
      case "FAILED":
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Agendamento ID</TableHead>
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
                  <TableCell className="font-medium">{payment.booking.client.name}</TableCell>
                  <TableCell>{payment.bookingId.substring(0, 8)}...</TableCell>
                  <TableCell>R$ {Number(payment.amount).toFixed(2)}</TableCell>
                  <TableCell>R$ {Number(payment.discountAmount || 0).toFixed(2)}</TableCell>
                  <TableCell>R$ {Number(payment.finalAmount).toFixed(2)}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {payment.transactionId && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://www.asaas.com/transactions/${payment.transactionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
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
                    </div>
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
