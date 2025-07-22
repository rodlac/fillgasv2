"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  document: string
  address: string
  city: string
  state: string
  zipCode: string
}

interface Service {
  id: string
  name: string
  price: number
}

interface Coupon {
  id: string
  code: string
  name: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minimumAmount: number | null
}

interface Booking {
  id: string
  clientId: string
  client: Client
  bookingDate: string
  status: string
  amount: number
  discountAmount: number
  finalAmount: number
  paymentMethod: string
  paymentStatus: string
  couponId: string | null
  coupon: Coupon | null
  services: Service[]
  createdAt: string
}

interface BookingViewModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
}

export default function BookingViewModal({ isOpen, onClose, booking }: BookingViewModalProps) {
  if (!booking) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento #{booking.id.substring(0, 8)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Cliente:</Label>
            <span className="col-span-3 font-medium">{booking.client.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Email do Cliente:</Label>
            <span className="col-span-3">{booking.client.email}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Telefone do Cliente:</Label>
            <span className="col-span-3">{booking.client.phone}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Data e Hora:</Label>
            <span className="col-span-3">{format(new Date(booking.bookingDate), "dd/MM/yyyy HH:mm")}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status:</Label>
            <span className="col-span-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.status === "confirmed"
                      ? "bg-blue-100 text-blue-800"
                      : booking.status === "in_route"
                        ? "bg-purple-100 text-purple-800"
                        : booking.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                }`}
              >
                {booking.status}
              </span>
            </span>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Serviços:</Label>
            <div className="col-span-3">
              {booking.services.length > 0 ? (
                booking.services.map((service) => (
                  <p key={service.id}>
                    - {service.name} (R$ {Number(service.price).toFixed(2)})
                  </p>
                ))
              ) : (
                <p>Nenhum serviço selecionado.</p>
              )}
            </div>
          </div>
          {booking.coupon && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Cupom:</Label>
              <span className="col-span-3">
                {booking.coupon.name} ({booking.coupon.code})
              </span>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Valor Original:</Label>
            <span className="col-span-3">R$ {Number(booking.amount).toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Desconto:</Label>
            <span className="col-span-3">R$ {Number(booking.discountAmount).toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Valor Final:</Label>
            <span className="col-span-3 font-bold text-lg">R$ {Number(booking.finalAmount).toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Método de Pagamento:</Label>
            <span className="col-span-3">{booking.paymentMethod}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status do Pagamento:</Label>
            <span className="col-span-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.paymentStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {booking.paymentStatus}
              </span>
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Criado Em:</Label>
            <span className="col-span-3">{format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
