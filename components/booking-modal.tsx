"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBookingModal } from "@/contexts/booking-modal-context"

export function BookingModal() {
  const {
    isOpen,
    closeModal,
    formData,
    clients,
    services,
    loading,
    submitting,
    discountAmount,
    totalAmount,
    handleInputChange,
    handleSelectChange,
    handleServiceChange,
    handleDateChange,
    handleTimeChange,
    handleCouponCodeChange,
    handleSubmit,
    couponError,
    isEditMode,
  } = useBookingModal()

  if (loading) {
    return null // Or a loading spinner
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(setOpen) => {
        if (!setOpen) closeModal()
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientId" className="text-right">
              Cliente
            </Label>
            <Select onValueChange={handleSelectChange("clientId")} value={formData.clientId}>
              <SelectTrigger className="col-span-3">
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryAddress" className="text-right">
              Endereço de Entrega
            </Label>
            <Input
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>

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
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deliveryDate ? format(formData.deliveryDate, "PPP") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.deliveryDate} onSelect={handleDateChange} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryTime" className="text-right">
              Hora
            </Label>
            <Input
              id="deliveryTime"
              name="deliveryTime"
              type="time"
              value={formData.deliveryTime}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Serviços</Label>
            <div className="col-span-3 grid gap-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={formData.serviceIds.includes(service.id)}
                    onCheckedChange={() => handleServiceChange(service.id)}
                  />
                  <Label htmlFor={`service-${service.id}`}>
                    {service.name} (R$ {Number(service.price).toFixed(2)})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="couponCode" className="text-right">
              Cupom
            </Label>
            <Input
              id="couponCode"
              name="couponCode"
              value={formData.couponCode}
              onChange={(e) => handleCouponCodeChange(e.target.value)}
              className="col-span-3"
              placeholder="Código do cupom"
            />
            {couponError && <p className="col-span-4 text-right text-sm text-red-500">{couponError}</p>}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Observações
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Observações adicionais"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={handleSelectChange("status")} value={formData.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentMethod" className="text-right">
              Método de Pagamento
            </Label>
            <Select onValueChange={handleSelectChange("paymentMethod")} value={formData.paymentMethod}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentStatus" className="text-right">
              Status do Pagamento
            </Label>
            <Select onValueChange={handleSelectChange("paymentStatus")} value={formData.paymentStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4 font-bold mt-4">
            <Label className="text-right">Subtotal</Label>
            <div className="col-span-3">R$ {totalAmount.toFixed(2)}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4 font-bold">
            <Label className="text-right">Desconto</Label>
            <div className="col-span-3">R$ {discountAmount.toFixed(2)}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4 font-bold text-lg">
            <Label className="text-right">Total</Label>
            <div className="col-span-3">R$ {totalAmount.toFixed(2)}</div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
