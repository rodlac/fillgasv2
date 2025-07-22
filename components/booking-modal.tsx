"use client"

import type React from "react"
import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useBookingModal } from "@/contexts/booking-modal-context"

export function BookingModal() {
  const {
    isOpen,
    closeModal,
    formData,
    setFormData,
    clients,
    services,
    isLoading,
    isSubmitting,
    errors,
    subtotal,
    discountAmount,
    totalAmount,
    handleServiceToggle,
    handleCouponCodeChange,
    validateCoupon,
    couponData,
    isCouponValidating,
    submitForm,
    setIsOpen, // Declared the variable here
  } = useBookingModal()

  useEffect(() => {
    if (isOpen && formData.couponCode) {
      validateCoupon()
    }
  }, [isOpen, formData.couponCode, validateCoupon])

  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, deliveryDate: date }))
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, deliveryTime: e.target.value }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return null // Or a loading spinner
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formData.id ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Client Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientId" className="text-right">
              Cliente
            </Label>
            <Select value={formData.clientId} onValueChange={handleSelectChange("clientId")}>
              <SelectTrigger className={cn("col-span-3", errors.clientId && "border-red-500")}>
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
            {errors.clientId && <p className="col-span-4 text-right text-sm text-red-500">{errors.clientId}</p>}
          </div>

          {/* Services Checkboxes */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Serviços</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={formData.serviceIds.includes(service.id)}
                    onCheckedChange={() => handleServiceToggle(service.id)}
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {service.name} (R${service.price.toFixed(2)})
                  </label>
                </div>
              ))}
            </div>
            {errors.serviceIds && <p className="col-span-4 text-right text-sm text-red-500">{errors.serviceIds}</p>}
          </div>

          {/* Delivery Address */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryAddress" className="text-right">
              Endereço
            </Label>
            <Input
              id="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleInputChange}
              className={cn("col-span-3", errors.deliveryAddress && "border-red-500")}
            />
            {errors.deliveryAddress && (
              <p className="col-span-4 text-right text-sm text-red-500">{errors.deliveryAddress}</p>
            )}
          </div>

          {/* Delivery Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryDate" className="text-right">
              Data
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !formData.deliveryDate && "text-muted-foreground",
                    errors.deliveryDate && "border-red-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deliveryDate ? format(formData.deliveryDate, "PPP") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.deliveryDate} onSelect={handleDateSelect} initialFocus />
              </PopoverContent>
            </Popover>
            {errors.deliveryDate && <p className="col-span-4 text-right text-sm text-red-500">{errors.deliveryDate}</p>}
          </div>

          {/* Delivery Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryTime" className="text-right">
              Hora
            </Label>
            <Input
              id="deliveryTime"
              type="time"
              value={formData.deliveryTime}
              onChange={handleTimeChange}
              className={cn("col-span-3", errors.deliveryTime && "border-red-500")}
            />
            {errors.deliveryTime && <p className="col-span-4 text-right text-sm text-red-500">{errors.deliveryTime}</p>}
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentMethod" className="text-right">
              Pagamento
            </Label>
            <Select value={formData.paymentMethod} onValueChange={handleSelectChange("paymentMethod")}>
              <SelectTrigger className={cn("col-span-3", errors.paymentMethod && "border-red-500")}>
                <SelectValue placeholder="Selecione um método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CASH">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="col-span-4 text-right text-sm text-red-500">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={formData.status} onValueChange={handleSelectChange("status")}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                <SelectItem value="COMPLETED">Concluído</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentStatus" className="text-right">
              Status Pagamento
            </Label>
            <Select value={formData.paymentStatus} onValueChange={handleSelectChange("paymentStatus")}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um status de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="REFUNDED">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Coupon Code */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="couponCode" className="text-right">
              Cupom
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="couponCode"
                value={formData.couponCode}
                onChange={handleInputChange}
                onBlur={validateCoupon}
                className={cn(errors.couponCode && "border-red-500")}
                placeholder="Código do cupom"
              />
              <Button onClick={validateCoupon} disabled={isCouponValidating || !formData.couponCode}>
                {isCouponValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar"}
              </Button>
            </div>
            {errors.couponCode && <p className="col-span-4 text-right text-sm text-red-500">{errors.couponCode}</p>}
            {couponData && (
              <p className="col-span-4 text-right text-sm text-green-600">
                Cupom: {couponData.code} ({couponData.discountType === "FIXED" ? "R$" : ""}
                {couponData.discountValue}
                {couponData.discountType === "PERCENTAGE" ? "%" : ""} OFF)
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Observações
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Observações adicionais"
            />
          </div>

          {/* Summary */}
          <div className="col-span-4 border-t pt-4 mt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal:</span>
              <span>R${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-red-600">
              <span>Desconto:</span>
              <span>-R${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold mt-2">
              <span>Total:</span>
              <span>R${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Cancelar
          </Button>
          <Button onClick={submitForm} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {formData.id ? "Salvar Alterações" : "Criar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
