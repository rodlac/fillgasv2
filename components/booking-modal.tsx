"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

interface Client {
  id: string
  name: string
  email: string
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
  id?: string
  clientId: string
  client?: Client
  deliveryAddress: string
  deliveryDate: string
  status: string
  amount: number
  discountAmount: number
  paymentMethod: string
  paymentStatus: string
  couponId: string | null
  coupon?: Coupon | null
  serviceIds: string[]
  services?: Service[]
  notes?: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  booking: Booking | null
}

export function BookingModal({ isOpen, onClose, onSave, booking }: BookingModalProps) {
  const { toast } = useToast()

  // Form state
  const [clientId, setClientId] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString())
  const [status, setStatus] = useState("scheduled")
  const [amount, setAmount] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("pix")
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [couponId, setCouponId] = useState<string | null>(null)
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  // Other state
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [selectedCouponCode, setSelectedCouponCode] = useState("")
  const [couponValidationResult, setCouponValidationResult] = useState<{
    isValid: boolean
    discountAmount?: number
    reason?: string
    coupon?: { id: string; code: string; name: string }
  } | null>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all form fields
      setClientId("")
      setDeliveryAddress("")
      setDeliveryDate(new Date().toISOString())
      setStatus("scheduled")
      setAmount(0)
      setDiscountAmount(0)
      setPaymentMethod("pix")
      setPaymentStatus("pending")
      setCouponId(null)
      setServiceIds([])
      setNotes("")
      setSelectedCouponCode("")
      setCouponValidationResult(null)
      return
    }

    if (booking) {
      console.log("Loading existing booking:", booking)
      setClientId(booking.clientId)
      setDeliveryAddress(booking.deliveryAddress)
      setDeliveryDate(new Date(booking.deliveryDate).toISOString())
      setStatus(booking.status)
      setAmount(Number(booking.amount))
      setDiscountAmount(Number(booking.discountAmount))
      setPaymentMethod(booking.paymentMethod)
      setPaymentStatus(booking.paymentStatus)
      setCouponId(booking.couponId)
      setServiceIds(booking.services?.map((s) => s.id) || [])
      setNotes(booking.notes || "")
      setSelectedCouponCode(booking.coupon?.code || "")

      if (booking.coupon) {
        setCouponValidationResult({
          isValid: true,
          discountAmount: Number(booking.discountAmount),
          coupon: {
            id: booking.coupon.id,
            code: booking.coupon.code,
            name: booking.coupon.name,
          },
        })
      }
    } else {
      console.log("Creating new booking - resetting form")
      setClientId("")
      setDeliveryAddress("")
      setDeliveryDate(new Date().toISOString())
      setStatus("scheduled")
      setAmount(0)
      setDiscountAmount(0)
      setPaymentMethod("pix")
      setPaymentStatus("pending")
      setCouponId(null)
      setServiceIds([])
      setNotes("")
      setSelectedCouponCode("")
      setCouponValidationResult(null)
    }
  }, [isOpen, booking])

  // Fetch initial data when modal opens
  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      try {
        console.log("Fetching initial data...")
        const [clientsRes, servicesRes, couponsRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/services"),
          fetch("/api/coupons"),
        ])

        const clientsData = await clientsRes.json()
        const servicesData = await servicesRes.json()
        const couponsData = await couponsRes.json()

        console.log("Clients data:", clientsData)
        console.log("Services data:", servicesData)
        console.log("Coupons data:", couponsData)

        setClients(Array.isArray(clientsData) ? clientsData : clientsData.clients || [])
        setServices(Array.isArray(servicesData) ? servicesData : [])
        setCoupons(Array.isArray(couponsData) ? couponsData : [])
      } catch (error) {
        console.error("Failed to fetch initial data:", error)
        toast({
          title: "Erro",
          description: "Falha ao carregar dados iniciais para o agendamento.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [isOpen, toast])

  // Calculate amount based on selected services
  useEffect(() => {
    const selectedServices = services.filter((s) => serviceIds.includes(s.id))
    const totalAmount = selectedServices.reduce((sum, service) => sum + Number(service.price), 0)
    setAmount(totalAmount)
  }, [serviceIds, services])

  // Apply coupon discount
  useEffect(() => {
    let discount = 0
    if (couponValidationResult?.isValid && couponValidationResult.discountAmount !== undefined) {
      discount = couponValidationResult.discountAmount
    }
    setDiscountAmount(discount)
  }, [amount, couponValidationResult])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    switch (id) {
      case "deliveryAddress":
        setDeliveryAddress(value)
        break
      case "notes":
        setNotes(value)
        break
    }
  }

  const handleClientChange = (value: string) => {
    console.log("Client changed to:", value)
    setClientId(value)
  }

  const handlePaymentMethodChange = (value: string) => {
    console.log("Payment method changed to:", value)
    setPaymentMethod(value)
  }

  const handlePaymentStatusChange = (value: string) => {
    console.log("Payment status changed to:", value)
    setPaymentStatus(value)
  }

  const handleStatusChange = (value: string) => {
    console.log("Status changed to:", value)
    setStatus(value)
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDeliveryDate(date.toISOString())
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setServiceIds((prev) => {
      const newServiceIds = prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
      console.log("Updated service IDs:", newServiceIds)
      return newServiceIds
    })
  }

  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCouponCode(e.target.value)
    setCouponValidationResult(null)
    setCouponId(null)
  }

  const handleValidateCoupon = async () => {
    if (!selectedCouponCode || !clientId) {
      setCouponValidationResult({ isValid: false, reason: "Código do cupom e cliente são obrigatórios." })
      return
    }
    setLoading(true)
    try {
      console.log("Validating coupon:", {
        code: selectedCouponCode,
        clientId: clientId,
        orderAmount: amount,
      })
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: selectedCouponCode,
          clientId: clientId,
          orderAmount: amount,
        }),
      })
      const data = await res.json()
      console.log("Coupon validation result:", data)
      setCouponValidationResult(data)
      if (data.isValid) {
        setCouponId(data.coupon.id)
        toast({ title: "Sucesso", description: "Cupom validado com sucesso!" })
      } else {
        toast({ title: "Erro", description: `Cupom inválido: ${data.reason}`, variant: "destructive" })
      }
    } catch (error) {
      console.error("Error validating coupon:", error)
      toast({ title: "Erro", description: "Falha ao validar cupom.", variant: "destructive" })
      setCouponValidationResult({ isValid: false, reason: "Erro na validação do cupom." })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = {
      clientId,
      deliveryAddress,
      deliveryDate,
      status,
      amount,
      discountAmount,
      paymentMethod,
      paymentStatus,
      couponId,
      serviceIds,
      notes,
    }

    console.log("Form submitted, current formData:", formData)

    // Validation
    if (!clientId) {
      console.log("Validation failed: no client selected")
      toast({ title: "Erro", description: "Selecione um cliente.", variant: "destructive" })
      return
    }

    if (!deliveryAddress.trim()) {
      console.log("Validation failed: no delivery address")
      toast({ title: "Erro", description: "Endereço de entrega é obrigatório.", variant: "destructive" })
      return
    }

    if (serviceIds.length === 0) {
      console.log("Validation failed: no services selected")
      toast({ title: "Erro", description: "Selecione pelo menos um serviço.", variant: "destructive" })
      return
    }

    if (selectedCouponCode && !couponValidationResult?.isValid) {
      console.log("Validation failed: coupon not validated")
      toast({
        title: "Atenção",
        description: "Valide o cupom antes de salvar o agendamento.",
        variant: "destructive",
      })
      return
    }

    console.log("Validation passed, starting API call...")
    setLoading(true)

    try {
      const method = booking ? "PUT" : "POST"
      const url = booking ? `/api/bookings/${booking.id}` : "/api/bookings"

      const payload = formData

      console.log("Sending request:", { method, url, payload })

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("Response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json()
        console.error("API error:", errorData)
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
      }

      const result = await res.json()
      console.log("Success result:", result)

      toast({
        title: "Sucesso",
        description: `Agendamento ${booking ? "atualizado" : "criado"} com sucesso.`,
      })
      onSave()
      onClose()
    } catch (error: any) {
      console.error("Failed to save booking:", error)
      toast({
        title: "Erro",
        description: `Falha ao ${booking ? "atualizar" : "criar"} agendamento: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const finalAmount = Math.max(0, amount - discountAmount)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientId" className="text-right">
                Cliente *
              </Label>
              <Select value={clientId} onValueChange={handleClientChange}>
                <SelectTrigger className="col-span-3">
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
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deliveryAddress" className="text-right">
                Endereço de Entrega *
              </Label>
              <Input
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Digite o endereço completo"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deliveryDate" className="text-right">
                Data e Hora *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="col-span-3 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? (
                      format(new Date(deliveryDate), "dd/MM/yyyy HH:mm")
                    ) : (
                      <span>Selecione uma data e hora</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={new Date(deliveryDate)} onSelect={handleDateChange} initialFocus />
                  <div className="p-3 border-t border-gray-200">
                    <Input
                      type="time"
                      value={format(new Date(deliveryDate), "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":").map(Number)
                        const newDate = new Date(deliveryDate)
                        newDate.setHours(hours, minutes)
                        setDeliveryDate(newDate.toISOString())
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Serviços *</Label>
              <div className="col-span-3 grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={serviceIds.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label htmlFor={`service-${service.id}`} className="text-sm">
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
              <div className="col-span-3 flex gap-2">
                <Input
                  id="couponCode"
                  value={selectedCouponCode}
                  onChange={handleCouponCodeChange}
                  placeholder="Código do cupom (opcional)"
                />
                <Button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={loading || !selectedCouponCode || !clientId}
                  size="sm"
                >
                  Validar
                </Button>
              </div>
            </div>
            {couponValidationResult && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div></div>
                <div className="col-span-3 text-sm">
                  {couponValidationResult.isValid ? (
                    <p className="text-green-600">
                      ✓ Cupom válido! Desconto: R$ {Number(couponValidationResult.discountAmount).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-red-600">✗ {couponValidationResult.reason}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Observações
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Observações adicionais (opcional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4 pt-4 border-t">
              <Label className="text-right">Valor dos Serviços</Label>
              <Input value={`R$ ${Number(amount).toFixed(2)}`} className="col-span-3 bg-gray-50" readOnly />
            </div>
            {discountAmount > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Desconto</Label>
                <Input
                  value={`- R$ ${Number(discountAmount).toFixed(2)}`}
                  className="col-span-3 bg-gray-50 text-green-600"
                  readOnly
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Valor Final</Label>
              <Input
                value={`R$ ${finalAmount.toFixed(2)}`}
                className="col-span-3 font-bold text-lg bg-blue-50"
                readOnly
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4 pt-4 border-t">
              <Label htmlFor="paymentMethod" className="text-right">
                Método de Pagamento
              </Label>
              <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentStatus" className="text-right">
                Status do Pagamento
              </Label>
              <Select value={paymentStatus} onValueChange={handlePaymentStatusChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status do Agendamento
              </Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="out_for_delivery">Saiu para Entrega</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
