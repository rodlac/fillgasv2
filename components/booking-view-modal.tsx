"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Wrench, FileText, Tag } from "lucide-react"

interface BookingViewModalProps {
  isOpen: boolean
  onClose: () => void
  booking: any
}

export default function BookingViewModal({ isOpen, onClose, booking }: BookingViewModalProps) {
  if (!booking) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendente"
      case "CONFIRMED":
        return "Confirmado"
      case "IN_PROGRESS":
        return "Em Andamento"
      case "COMPLETED":
        return "Concluído"
      case "CANCELLED":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">#{booking.id}</h3>
            <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{booking.client?.name}</p>
                <p className="text-sm text-gray-500">{booking.client?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Wrench className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{booking.service?.name}</p>
                <p className="text-sm text-gray-500">R$ {booking.service?.price?.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <p>{new Date(booking.scheduledDate).toLocaleDateString("pt-BR")}</p>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <p>{booking.scheduledTime}</p>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <p>{booking.address}</p>
            </div>

            {booking.couponCode && (
              <div className="flex items-center space-x-3">
                <Tag className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Cupom: {booking.couponCode}</p>
                  {booking.discountAmount && (
                    <p className="text-sm text-green-600">Desconto: R$ {booking.discountAmount.toFixed(2)}</p>
                  )}
                </div>
              </div>
            )}

            {booking.notes && (
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Observações:</p>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold">R$ {booking.totalAmount?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
