"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBookingModal } from "@/contexts/booking-modal-context"

export default function BookingModal() {
  const {
    isOpen,
    formData,
    clients,
    services,
    couponValidation,
    isLoading,
    closeModal,
    updateFormData,
    validateCoupon,
    calculateTotal,
    submitBooking,
  } = useBookingModal()

  const total = calculateTotal()

  useEffect(() => {
    if (formData.couponCode && total > 0) {
      const timeoutId = setTimeout(() => {
        validateCoupon(formData.couponCode, total)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [formData.couponCode, total, validateCoupon])

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    const newServiceIds = checked
      ? [...formData.serviceIds, serviceId]
      : formData.serviceIds.filter((id) => id !== serviceId)
    updateFormData("serviceIds", newServiceIds)
  }

  const finalAmount = couponValidation?.finalAmount || total

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="client">Cliente</Label>
            <Select value={formData.clientId} onValueChange={(value) => updateFormData("clientId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Serviços</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={service.id}
                    checked={formData.serviceIds.includes(service.id)}
                    onChange={(e) => handleServiceChange(service.id, e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor={service.id} className="flex-1 text-sm">
                    {service.name} - R$ {service.price.toFixed(2)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="deliveryAddress">Endereço de Entrega</Label>
            <Textarea
              id="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={(e) => updateFormData("deliveryAddress", e.target.value)}
              placeholder="Digite o endereço completo"
            />
          </div>

          <div>
            <Label htmlFor="deliveryDate">Data de Entrega</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => updateFormData("deliveryDate", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentStatus">Status do Pagamento</Label>
              <Select value={formData.paymentStatus} onValueChange={(value) => updateFormData("paymentStatus", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="PAID">Pago</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => updateFormData("paymentMethod", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                <SelectItem value="CASH">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="couponCode">Código do Cupom</Label>
            <Input
              id="couponCode"
              value={formData.couponCode}
              onChange={(e) => updateFormData("couponCode", e.target.value)}
              placeholder="Digite o código do cupom"
            />
            {couponValidation && (
              <div className={`text-sm mt-1 ${couponValidation.isValid ? "text-green-600" : "text-red-600"}`}>
                {couponValidation.isValid
                  ? `Cupom aplicado! Desconto: R$ ${couponValidation.discountAmount.toFixed(2)}`
                  : couponValidation.error}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              placeholder="Observações adicionais"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            {couponValidation?.isValid && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto:</span>
                <span>-R$ {couponValidation.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>R$ {finalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              onClick={submitBooking}
              disabled={isLoading || !formData.clientId || formData.serviceIds.length === 0}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
