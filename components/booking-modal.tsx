"use client"

import type React from "react"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useBookingModal } from "@/contexts/booking-modal-context"

export function BookingModal() {
  const {
    // State
    isOpen,
    isLoading,
    clientId,
    serviceIds,
    scheduledDate,
    scheduledTime,
    notes,
    paymentMethod,
    status,
    couponCode,
    subtotal,
    discountAmount,
    finalAmount,
    clients,
    services,
    errors,

    // Actions
    closeModal,
    setClientId,
    setServiceIds,
    setScheduledDate,
    setScheduledTime,
    setNotes,
    setPaymentMethod,
    setStatus,
    setCouponCode,
    loadClients,
    loadServices,
    validateCoupon,
    submitBooking,
  } = useBookingModal()

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened, loading data...")
      loadClients()
      loadServices()
    }
  }, [isOpen, loadClients, loadServices])

  // Validate coupon when coupon code changes
  useEffect(() => {
    if (couponCode) {
      const timeoutId = setTimeout(() => {
        validateCoupon()
      }, 500) // Debounce validation

      return () => clearTimeout(timeoutId)
    }
  }, [couponCode, validateCoupon])

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    console.log("Toggling service:", serviceId, checked)
    if (checked) {
      setServiceIds([...serviceIds, serviceId])
    } else {
      setServiceIds(serviceIds.filter((id) => id !== serviceId))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")
    submitBooking()
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="text-sm text-red-500">{errors.clientId}</p>}
          </div>

          {/* Services Selection */}
          <div className="space-y-2">
            <Label>Serviços *</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={serviceIds.includes(service.id)}
                    onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                  />
                  <Label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                    {service.name} - R$ {service.price.toFixed(2)}
                  </Label>
                </div>
              ))}
            </div>
            {errors.serviceIds && <p className="text-sm text-red-500">{errors.serviceIds}</p>}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.scheduledDate && <p className="text-sm text-red-500">{errors.scheduledDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input id="time" type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
              {errors.scheduledTime && <p className="text-sm text-red-500">{errors.scheduledTime}</p>}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Método de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="BANK_TRANSFER">Transferência Bancária</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && <p className="text-sm text-red-500">{errors.paymentMethod}</p>}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
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

          {/* Coupon Code */}
          <div className="space-y-2">
            <Label htmlFor="coupon">Código do Cupom</Label>
            <Input
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Digite o código do cupom"
            />
            {errors.couponCode && <p className="text-sm text-red-500">{errors.couponCode}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          {/* Totals */}
          {serviceIds.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto:</span>
                  <span>- R$ {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>R$ {finalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{errors.submit}</div>}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || serviceIds.length === 0}>
              {isLoading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
