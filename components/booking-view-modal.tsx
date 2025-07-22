"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Service {
  id: string
  name: string
  price: number
}

interface Booking {
  id: string
  clientId: string
  client: {
    name: string
    email: string
    phone: string
  }
  deliveryAddress: string
  deliveryDate: string
  paymentMethod: string
  status: string
  totalPrice: number
  discountAmount?: number
  couponId?: string
  bookingServices: Array<{
    id: string
    quantity: number
    service: Service
  }>
  payments: Array<{
    id: string
    amount: number
    finalAmount: number
    status: string
    paymentMethod: string
    createdAt: string
  }>
  createdAt: string
}

interface BookingViewModalProps {
  open: boolean
  onClose: () => void
  booking: Booking | null
}

export function BookingViewModal({ open, onClose, booking }: BookingViewModalProps) {
  if (!booking) return null

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default"
      case "PENDING":
      case "AWAITING_TRANSFER":
        return "secondary"
      case "CANCELLED":
      case "FAILED":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento #{booking.id.substring(0, 8)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Cliente:</div>
            <div>{booking.client.name}</div>
            <div className="font-medium">Email do Cliente:</div>
            <div>{booking.client.email}</div>
            <div className="font-medium">Telefone do Cliente:</div>
            <div>{booking.client.phone}</div>
            <div className="font-medium">Endereço de Entrega:</div>
            <div>{booking.deliveryAddress}</div>
            <div className="font-medium">Data de Entrega:</div>
            <div>{format(new Date(booking.deliveryDate), "dd/MM/yyyy")}</div>
            <div className="font-medium">Método de Pagamento:</div>
            <div>{booking.paymentMethod}</div>
            <div className="font-medium">Status:</div>
            <div>
              <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
            </div>
            <div className="font-medium">Criado em:</div>
            <div>{format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")}</div>
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="text-lg font-semibold mb-2">Serviços Agendados</h3>
            {booking.bookingServices.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {booking.bookingServices.map((bs) => (
                  <li key={bs.id}>
                    {bs.service.name} (x{bs.quantity}) - R$ {Number(bs.service.price).toFixed(2)} cada
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum serviço agendado.</p>
            )}
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="text-lg font-semibold mb-2">Resumo Financeiro</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Valor Total dos Serviços:</div>
              <div>R$ {Number(booking.totalPrice + (booking.discountAmount || 0)).toFixed(2)}</div>
              <div className="font-medium">Desconto ({booking.couponId ? `Cupom: ${booking.couponId}` : "N/A"}):</div>
              <div>- R$ {Number(booking.discountAmount || 0).toFixed(2)}</div>
              <div className="font-medium text-lg">Valor Final:</div>
              <div className="font-bold text-lg">R$ {Number(booking.totalPrice).toFixed(2)}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="text-lg font-semibold mb-2">Histórico de Pagamentos</h3>
            {booking.payments.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {booking.payments.map((payment) => (
                  <li key={payment.id}>
                    R$ {Number(payment.finalAmount).toFixed(2)} via {payment.paymentMethod} - Status:{" "}
                    <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge> em{" "}
                    {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum pagamento registrado.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
