"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Service {
  id: string
  name: string
  price: number
  quantity: number
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Coupon {
  id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minimumAmount?: number
}

interface Payment {
  id: string
  method: string
  amount: number
  status: string
  createdAt: string
}

interface Booking {
  id: string
  clientId: string
  client: Client
  deliveryAddress: string
  deliveryDate: string
  status: string
  paymentStatus: string
  paymentMethod: string
  amount: number
  discountAmount: number
  couponId?: string
  coupon?: Coupon
  notes?: string
  services: Service[]
  payments: Payment[]
  createdAt: string
}

interface BookingViewModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const paymentStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default function BookingViewModal({ booking, isOpen, onClose }: BookingViewModalProps) {
  if (!booking) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex gap-4">
            <Badge className={statusColors[booking.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
              {booking.status}
            </Badge>
            <Badge
              className={
                paymentStatusColors[booking.paymentStatus as keyof typeof paymentStatusColors] ||
                "bg-gray-100 text-gray-800"
              }
            >
              {booking.paymentStatus}
            </Badge>
          </div>

          {/* Cliente */}
          <div>
            <h3 className="font-semibold mb-2">Cliente</h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Nome:</strong> {booking.client.name}
              </p>
              <p>
                <strong>Email:</strong> {booking.client.email}
              </p>
              <p>
                <strong>Telefone:</strong> {booking.client.phone}
              </p>
              <p>
                <strong>Endereço:</strong> {booking.client.address}
              </p>
            </div>
          </div>

          <Separator />

          {/* Serviços */}
          <div>
            <h3 className="font-semibold mb-2">Serviços</h3>
            <div className="space-y-2">
              {booking.services.map((service) => (
                <div key={service.id} className="flex justify-between items-center text-sm">
                  <span>
                    {service.name} (x{service.quantity})
                  </span>
                  <span>R$ {(service.price * service.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Entrega */}
          <div>
            <h3 className="font-semibold mb-2">Entrega</h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Data:</strong> {formatDate(booking.deliveryDate)}
              </p>
              <p>
                <strong>Endereço:</strong> {booking.deliveryAddress}
              </p>
            </div>
          </div>

          <Separator />

          {/* Pagamento */}
          <div>
            <h3 className="font-semibold mb-2">Pagamento</h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Método:</strong> {booking.paymentMethod}
              </p>
              <p>
                <strong>Subtotal:</strong> R$ {booking.amount.toFixed(2)}
              </p>
              {booking.discountAmount > 0 && (
                <p>
                  <strong>Desconto:</strong> -R$ {booking.discountAmount.toFixed(2)}
                </p>
              )}
              <p>
                <strong>Total:</strong> R$ {(booking.amount - booking.discountAmount).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Cupom */}
          {booking.coupon && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Cupom Aplicado</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Código:</strong> {booking.coupon.code}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {booking.coupon.discountType === "PERCENTAGE" ? "Percentual" : "Valor Fixo"}
                  </p>
                  <p>
                    <strong>Valor:</strong>{" "}
                    {booking.coupon.discountType === "PERCENTAGE"
                      ? `${booking.coupon.discountValue}%`
                      : `R$ ${booking.coupon.discountValue.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Observações */}
          {booking.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-sm">{booking.notes}</p>
              </div>
            </>
          )}

          {/* Histórico de Pagamentos */}
          {booking.payments && booking.payments.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Histórico de Pagamentos</h3>
                <div className="space-y-2">
                  {booking.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center text-sm border rounded p-2">
                      <div>
                        <p>
                          <strong>Método:</strong> {payment.method}
                        </p>
                        <p>
                          <strong>Data:</strong> {formatDateTime(payment.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>R$ {payment.amount.toFixed(2)}</p>
                        <Badge
                          className={
                            payment.status === "VERIFIED"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Informações do Sistema */}
          <div>
            <h3 className="font-semibold mb-2">Informações do Sistema</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>ID:</strong> {booking.id}
              </p>
              <p>
                <strong>Criado em:</strong> {formatDateTime(booking.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
