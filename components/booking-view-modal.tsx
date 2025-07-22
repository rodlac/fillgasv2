"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface BookingViewModalProps {
  open: boolean
  onClose: () => void
  booking?: any
}

export function BookingViewModal({ open, onClose, booking }: BookingViewModalProps) {
  if (!booking) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "delivered":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendente"
      case "delivered":
        return "Entregue"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Cliente</h3>
              <p className="mt-1 text-lg font-medium">{booking.client?.name}</p>
              <p className="text-sm text-gray-600">{booking.client?.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Status</h3>
              <div className="mt-1">
                <Badge variant={getStatusColor(booking.status)}>{getStatusLabel(booking.status)}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Endereço de Entrega</h3>
            <p className="mt-1">{booking.deliveryAddress}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Data de Entrega</h3>
              <p className="mt-1">{new Date(booking.deliveryDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Método de Pagamento</h3>
              <p className="mt-1">{booking.paymentMethod}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Serviços</h3>
            <div className="space-y-2">
              {booking.bookingServices?.map((bs: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{bs.service?.name}</p>
                    <p className="text-sm text-gray-600">Quantidade: {bs.quantity}</p>
                  </div>
                  <p className="font-medium">R$ {(bs.service?.price * bs.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold">R$ {booking.amount?.toFixed(2)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
