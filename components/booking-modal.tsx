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
import { toast } from "@/components/ui/use-toast"
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
  const [formData, setFormData] = useState<Booking>({
    clientId: "",
    deliveryAddress: "",
    deliveryDate: new Date().toISOString(),
    status: "scheduled",
    amount: 0,
    discountAmount: 0,
    paymentMethod: "pix",
    paymentStatus: "pending",
    couponId: null,
    serviceIds: [],
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>("")
  const [couponValidationResult, setCouponValidationResult] = useState<{
    isValid: boolean
    discountAmount?: number
    reason?: string
    coupon?: { id: string; code: string; name: string }
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, servicesRes, couponsRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/services"),
          fetch("/api/coupons"),
        ])

        const clientsData = await clientsRes.json()
        const servicesData = await servicesRes.json()
        const couponsData = await couponsRes.json()

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

    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  useEffect(() => {
    if (booking) {
      setFormData({
        ...booking,
        amount: Number(booking.amount),
        discountAmount: Number(booking.discountAmount),
        deliveryDate: new Date(booking.deliveryDate).toISOString(),
        serviceIds: booking.services?.map((s) => s.id) || [],
      })
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
      setFormData({
        clientId: "",
        deliveryAddress: "",
        deliveryDate: new Date().toISOString(),
        status: "scheduled",
        amount: 0,
        discountAmount: 0,
        paymentMethod: "pix",
        paymentStatus: "pending",
        couponId: null,
        serviceIds: [],
        notes: "",
      })
      setSelectedCouponCode("")
      setCouponValidationResult(null)
    }
  }, [booking, isOpen])

  useEffect(() => {
    // Calculate amount based on selected services
    const selectedServices = services.filter((s) => formData.serviceIds.includes(s.id))
    const totalAmount = selectedServices.reduce((sum, service) => sum + Number(service.price), 0)
    setFormData((prev) => ({ ...prev, amount: totalAmount }))
  }, [formData.serviceIds, services])

  useEffect(() => {
    // Apply coupon discount
    let discount = 0
    if (couponValidationResult?.isValid && couponValidationResult.discountAmount !== undefined) {
      discount = couponValidationResult.discountAmount
    }
    setFormData((prev) => ({
      ...prev,
      discountAmount: discount,
    }))
  }, [formData.amount, couponValidationResult])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSelectChange = (value: string, field: keyof Booking) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        deliveryDate: date.toISOString(),
      }))
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId]
      return { ...prev, serviceIds: newServiceIds }
    })
  }

  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCouponCode(e.target.value)
    setCouponValidationResult(null)
    setFormData((prev) => ({ ...prev, couponId: null }))
  }

  const handleValidateCoupon = async () => {
    if (!selectedCouponCode || !formData.clientId) {
      setCouponValidationResult({ isValid: false, reason: "Código do cupom e cliente são obrigatórios." })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: selectedCouponCode,
          clientId: formData.clientId,
          orderAmount: formData.amount,
        }),
      })
      const data = await res.json()
      setCouponValidationResult(data)
      if (data.isValid) {
        setFormData((prev) => ({ ...prev, couponId: data.coupon.id }))
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
    setLoading(true)

    // Validation
    if (!formData.clientId) {
      toast({ title: "Erro", description: "Selecione um cliente.", variant: "destructive" })
      setLoading(false)
      return
    }

    if (!formData.deliveryAddress.trim()) {
      toast({ title: "Erro", description: "Endereço de entrega é obrigatório.", variant: "destructive" })
      setLoading(false)
      return
    }

    if (formData.serviceIds.length === 0) {
      toast({ title: "Erro", description: "Selecione pelo menos um serviço.", variant: "destructive" })
      setLoading(false)
      return
    }

    if (selectedCouponCode && !couponValidationResult?.isValid) {
      toast({
        title: "Atenção",
        description: "Valide o cupom antes de salvar o agendamento.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const method = booking ? "PUT" : "POST"
      const url = booking ? `/api/bookings/${booking.id}` : "/api/bookings"

      const payload = {
        ...formData,
        deliveryDate: formData.deliveryDate,
        amount: formData.amount,
        discountAmount: formData.discountAmount,
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
      }

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

  const finalAmount = Math.max(0, formData.amount - formData.discountAmount)

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
              <Select value={formData.clientId} onValueChange={(value) => handleSelectChange(value, "clientId")}>
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
                value={formData.deliveryAddress}
                onChange={handleChange}
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
                    {formData.deliveryDate ? (
                      format(new Date(formData.deliveryDate), "dd/MM/yyyy HH:mm")
                    ) : (
                      <span>Selecione uma data e hora</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.deliveryDate)}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                  <div className="p-3 border-t border-gray-200">
                    <Input
                      type="time"
                      value={format(new Date(formData.deliveryDate), "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":").map(Number)
                        const newDate = new Date(formData.deliveryDate)
                        newDate.setHours(hours, minutes)
                        setFormData((prev) => ({ ...prev, deliveryDate: newDate.toISOString() }))
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
                      checked={formData.serviceIds.includes(service.id)}
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
                  disabled={loading || !selectedCouponCode || !formData.clientId}
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
                value={formData.notes || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Observações adicionais (opcional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4 pt-4 border-t">
              <Label className="text-right">Valor dos Serviços</Label>
              <Input value={`R$ ${Number(formData.amount).toFixed(2)}`} className="col-span-3 bg-gray-50" readOnly />
            </div>
            {formData.discountAmount > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Desconto</Label>
                <Input
                  value={`- R$ ${Number(formData.discountAmount).toFixed(2)}`}
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
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleSelectChange(value, "paymentMethod")}
              >
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
              <Select
                value={formData.paymentStatus}
                onValueChange={(value) => handleSelectChange(value, "paymentStatus")}
              >
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
              <Select value={formData.status} onValueChange={(value) => handleSelectChange(value, "status")}>
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
