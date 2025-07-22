"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Command, CommandList, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { useBookingModal } from "@/contexts/booking-modal-context"
import { useState, useEffect } from "react"

export default function BookingModal() {
  const {
    isOpen,
    closeModal,
    formData,
    setFormData,
    clients,
    services,
    isLoading,
    isSubmitting,
    isCouponValidating,
    couponDiscount,
    totalAmount,
    finalAmount,
    handleSelectChange,
    handleDateChange,
    handleCouponCodeChange,
    validateCoupon,
    handleSubmit,
  } = useBookingModal()

  const [clientOpen, setClientOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  // Effect to update form data when services or clients change (e.g., after initial fetch)
  useEffect(() => {
    if (!isLoading && formData.clientId && !clients.some((c) => c.id === formData.clientId)) {
      setFormData((prev) => ({ ...prev, clientId: "" }))
    }
    if (!isLoading && formData.selectedServiceIds.length > 0) {
      const validServiceIds = formData.selectedServiceIds.filter((id) => services.some((s) => s.id === id))
      if (validServiceIds.length !== formData.selectedServiceIds.length) {
        setFormData((prev) => ({ ...prev, selectedServiceIds: validServiceIds }))
      }
    }
  }, [isLoading, clients, services, formData.clientId, formData.selectedServiceIds, setFormData])

  if (isLoading) {
    return null // Or a loading spinner
  }

  const selectedClient = clients.find((client) => client.id === formData.clientId)
  const selectedServices = services.filter((service) => formData.selectedServiceIds.includes(service.id))

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formData.id ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientId" className="text-right">
              Cliente
            </Label>
            <Popover open={clientOpen} onOpenChange={setClientOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientOpen}
                  className="col-span-3 justify-between bg-transparent"
                >
                  {selectedClient ? selectedClient.name : "Selecione um cliente..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandList>
                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => {
                            handleSelectChange("clientId")(client.id)
                            setClientOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.clientId === client.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {client.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bookingDate" className="text-right">
              Data e Hora
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !formData.bookingDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.bookingDate ? (
                    format(formData.bookingDate, "dd/MM/yyyy HH:mm", { locale: ptBR })
                  ) : (
                    <span>Selecione a data e hora</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.bookingDate}
                  onSelect={handleDateChange}
                  initialFocus
                  locale={ptBR}
                />
                <div className="p-3 border-t border-border">
                  <Input
                    type="time"
                    value={formData.bookingDate ? format(formData.bookingDate, "HH:mm") : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":").map(Number)
                      if (formData.bookingDate) {
                        const newDate = new Date(formData.bookingDate)
                        newDate.setHours(hours, minutes)
                        handleDateChange(newDate)
                      } else {
                        const now = new Date()
                        now.setHours(hours, minutes)
                        handleDateChange(now)
                      }
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="services" className="text-right pt-2">
              Serviços
            </Label>
            <div className="col-span-3 flex flex-col gap-2">
              <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={servicesOpen}
                    className="justify-between bg-transparent"
                  >
                    {formData.selectedServiceIds.length > 0
                      ? `${formData.selectedServiceIds.length} serviço(s) selecionado(s)`
                      : "Selecione serviços..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar serviço..." />
                    <CommandList>
                      <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                      <CommandGroup>
                        {services.map((service) => (
                          <CommandItem
                            key={service.id}
                            value={service.name}
                            onSelect={() => {
                              const currentSelection = new Set(formData.selectedServiceIds)
                              if (currentSelection.has(service.id)) {
                                currentSelection.delete(service.id)
                              } else {
                                currentSelection.add(service.id)
                              }
                              handleSelectChange("selectedServiceIds")(Array.from(currentSelection))
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.selectedServiceIds.includes(service.id) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {service.name} (R$ {service.price.toFixed(2)})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedServices.map((service) => (
                  <Badge key={service.id} variant="secondary" className="flex items-center gap-1">
                    {service.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => {
                        const newSelection = formData.selectedServiceIds.filter((id) => id !== service.id)
                        handleSelectChange("selectedServiceIds")(newSelection)
                      }}
                    >
                      x
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="couponCode" className="text-right">
              Cupom
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="couponCode"
                value={formData.couponCode}
                onChange={(e) => handleCouponCodeChange(e.target.value)}
                className="flex-grow"
              />
              <Button type="button" onClick={validateCoupon} disabled={isCouponValidating || !formData.couponCode}>
                {isCouponValidating ? "Validando..." : "Validar"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Valor Total</Label>
            <span className="col-span-3 font-medium">R$ {totalAmount.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Desconto</Label>
            <span className="col-span-3 text-red-500">R$ {couponDiscount.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Valor Final</Label>
            <span className="col-span-3 font-bold text-lg">R$ {finalAmount.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentMethod" className="text-right">
              Método de Pagamento
            </Label>
            <Select value={formData.paymentMethod} onValueChange={handleSelectChange("paymentMethod")}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentStatus" className="text-right">
              Status do Pagamento
            </Label>
            <Select value={formData.paymentStatus} onValueChange={handleSelectChange("paymentStatus")}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="refunded">Estornado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
