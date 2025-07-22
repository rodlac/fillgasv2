"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface BookingViewModalProps {
  open: boolean
  onClose: () => void
  booking: any
}

export function BookingViewModal({ open, onClose, booking }: BookingViewModalProps) {
  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-semibold">Cliente:</h3>
            <p>{booking.client?.name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Endereço de Entrega:</h3>
            <p>{booking.deliveryAddress}</p>
          </div>
          <div>
            <h3 className="font-semibold">Data de Entrega:</h3>
            <p>{format(new Date(booking.deliveryDate), "dd/MM/yyyy")}</p>
          </div>
          <div>
            <h3 className="font-semibold">Método de Pagamento:</h3>
            <p>{booking.paymentMethod}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status:</h3>
            <Badge>{booking.status}</Badge>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold">Serviços:</h3>
            <ul className="list-disc pl-5">
              {booking.bookingServices?.map((bs: any) => (
                <li key={bs.id}>
                  {bs.service?.name} (x{bs.quantity}) - R$ {Number(bs.service?.price).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg">Total:</h3>
            <p className="text-2xl font-bold">R$ {Number(booking.totalPrice).toFixed(2)}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
