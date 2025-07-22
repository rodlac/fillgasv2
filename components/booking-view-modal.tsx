"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  cpfCnpj: string
  address: string
}

interface Service {
  id: string
  name: string
  price: number
}

interface Coupon {
  id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minimumAmount?: number | null
}

interface Payment {
  id: string
  amount: number
  status: string
  method: string
  paymentDate: string
  transactionId?: string | null
  proofUrl?: string | null
  verificationNotes?: string | null
}

interface Booking {
  id: string
  clientId: string
  client: Client
  bookingDate: string
  deliveryAddress: string
  status: string
  totalAmount: number
  discountAmount?: number | null
  finalAmount: number
  services: Service[]
  coupon?: Coupon | null
  payment?: Payment | null
}

interface BookingViewModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  onEdit: () => void
  onUpdateStatus: () => void
}

export function BookingViewModal({ isOpen, onClose, booking, onEdit, onUpdateStatus }: BookingViewModalProps) {
  const { toast } = useToast()
  const [currentStatus, setCurrentStatus] = useState(booking?.status || "")

  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return

    try {
      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error("Failed to update booking status")
      }

      setCurrentStatus(newStatus)
      toast({
        title: "Sucesso!",
        description: `Status do agendamento atualizado para ${newStatus}.`,
      })
      onUpdateStatus() // Refresh data in parent component
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do agendamento.",
        variant: "destructive",
      })
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary"
      case "CONFIRMED":
        return "default"
      case "IN_ROUTE":
        return "outline"
      case "DELIVERED":
        return "success"
      case "CANCELED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (!booking) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Cliente:</Label>
            <span className="col-span-3 font-medium">{booking.client?.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Data:</Label>
            <span className="col-span-3">{new Date(booking.bookingDate).toLocaleDateString()}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Endereço:</Label>
            <span className="col-span-3">{booking.deliveryAddress}</span>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Serviços:</Label>
            <div className="col-span-3 space-y-1">
              {booking.services.map((service) => (
                <div key={service.id}>
                  {service.name} (R$ {Number(service.price).toFixed(2)})
                </div>
              ))}
            </div>
          </div>
          {booking.coupon && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Cupom:</Label>
              <span className="col-span-3">
                {booking.coupon.code} (
                {booking.coupon.discountType === "PERCENTAGE"
                  ? `${Number(booking.coupon.discountValue).toFixed(0)}%`
                  : `R$ ${Number(booking.coupon.discountValue).toFixed(2)}`}
                )
              </span>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Valor Total:</Label>
            <span className="col-span-3">R$ {Number(booking.totalAmount).toFixed(2)}</span>
          </div>
          {booking.discountAmount !== null && booking.discountAmount > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Desconto:</Label>
              <span className="col-span-3">R$ {Number(booking.discountAmount).toFixed(2)}</span>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Valor Final:</Label>
            <span className="col-span-3 font-bold">R$ {Number(booking.finalAmount).toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status:</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Badge variant={getStatusVariant(currentStatus)}>{currentStatus}</Badge>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alterar Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDENTE</SelectItem>
                  <SelectItem value="CONFIRMED">CONFIRMADO</SelectItem>
                  <SelectItem value="IN_ROUTE">EM ROTA</SelectItem>
                  <SelectItem value="DELIVERED">ENTREGUE</SelectItem>
                  <SelectItem value="CANCELED">CANCELADO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {booking.payment && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Pagamento:</Label>
              <span className="col-span-3">
                R$ {Number(booking.payment.amount).toFixed(2)} ({booking.payment.method} - {booking.payment.status})
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onEdit}>
            Editar
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
