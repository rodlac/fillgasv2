"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchIcon, ExternalLinkIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Booking {
  id: string
  client: {
    name: string
  }
  amount: number
  discountAmount: number
  finalAmount: number
}

interface Payment {
  id: string
  bookingId: string
  booking: Booking
  amount: number
  discountAmount: number
  finalAmount: number
  paymentMethod: string
  paymentStatus: string
  transactionId: string | null
  proofOfPaymentUrl: string | null
  verificationNotes: string | null
  createdAt: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/payments")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setPayments(data || []) // Ensure it's an array
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar pagamentos.",
        variant: "destructive",
      })
      setPayments([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.booking?.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || payment.paymentStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Carregando pagamentos...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Pagamentos</h1>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por cliente, agendamento ou ID da transação..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
            <SelectItem value="refunded">Estornado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pagamento</TableHead>
              <TableHead>Agendamento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor Original</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Valor Final</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id.substring(0, 8)}...</TableCell>
                  <TableCell>{payment.bookingId.substring(0, 8)}...</TableCell>
                  <TableCell>{payment.booking?.client?.name || "N/A"}</TableCell>
                  <TableCell>R$ {Number(payment.amount).toFixed(2)}</TableCell>
                  <TableCell>R$ {Number(payment.discountAmount).toFixed(2)}</TableCell>
                  <TableCell>R$ {Number(payment.finalAmount).toFixed(2)}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : payment.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell className="text-right">
                    {payment.transactionId && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={`https://www.asaas.com/transactions/${payment.transactionId}`} // Replace with actual Asaas link
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver no Asaas"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {/* Add more actions like view proof of payment if applicable */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  Nenhum pagamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
