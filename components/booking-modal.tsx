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

interface Client {
  id: string
  name: string
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
  bookingDate: string
  status: string
  amount: number
  discountAmount: number
  finalAmount: number
  paymentMethod: string
  paymentStatus: string
  couponId: string | null
  serviceIds: string[]
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
}

export function BookingModal({ isOpen, onClose, booking }: BookingModalProps) {
  const [formData, setFormData] = useState<Booking>({
    clientId: "",
    bookingDate: new Date().toISOString(),
    status: "pending",
    amount: 0,
    discountAmount: 0,
    finalAmount: 0,
    paymentMethod: "pix",
    paymentStatus: "pending",
    couponId: null,
    serviceIds: [],
  })
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [selectedCouponCode, setSelectedCouponCode] = useState<string | null>(null)
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

        setClients(clientsData.clients || [])
        setServices(servicesData || [])
        setCoupons(couponsData || [])
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
  }, [])

  useEffect(() => {
    if (booking) {
      setFormData({
        ...booking,
        amount: Number(booking.amount),
        discountAmount: Number(booking.discountAmount),
        finalAmount: Number(booking.finalAmount),
        bookingDate: new Date(booking.bookingDate).toISOString(),
        serviceIds: booking.services.map((s) => s.id),
      })
      setSelectedCouponCode(booking.coupon?.code || null)
    } else {
      setFormData({
        clientId: "",
        bookingDate: new Date().toISOString(),
        status: "pending",
        amount: 0,
        discountAmount: 0,
        finalAmount: 0,
        paymentMethod: "pix",
        paymentStatus: "pending",
        couponId: null,
        serviceIds: [],
      })
      setSelectedCouponCode(null)
      setCouponValidationResult(null)
    }
  }, [booking])

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
      finalAmount: Math.max(0, prev.amount - discount),
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
        bookingDate: date.toISOString(),
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
    setCouponValidationResult(null) // Reset validation on change
    setFormData((prev) => ({ ...prev, couponId: null })) // Clear couponId until validated
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
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
      }

      toast({
        title: "Sucesso",
        description: `Agendamento ${booking ? "atualizado" : "criado"} com sucesso.`,
      })
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{booking ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientId" className="text-right">
                Cliente
              </Label>
              <Select value={formData.clientId} onValueChange={(value) => handleSelectChange(value, "clientId")}>
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
              <Label htmlFor="bookingDate" className="text-right">
                Data e Hora
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="col-span-3 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.bookingDate ? (
                      format(new Date(formData.bookingDate), "dd/MM/yyyy HH:mm")
                    ) : (
                      <span>Selecione uma data e hora</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.bookingDate)}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                  <div className="p-3 border-t border-gray-200">
                    <Input
                      type="time"
                      value={format(new Date(formData.bookingDate), "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":").map(Number)
                        const newDate = new Date(formData.bookingDate)
                        newDate.setHours(hours, minutes)
                        setFormData((prev) => ({ ...prev, bookingDate: newDate.toISOString() }))
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

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
              <div className="col-span-3 flex gap-2">
                <Input
                  id="couponCode"
                  value={selectedCouponCode || ""}
                  onChange={handleCouponCodeChange}
                  placeholder="Código do cupom (opcional)"
                />
                <Button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={loading || !selectedCouponCode || !formData.clientId}
                >
                  Validar
                </Button>
              </div>
            </div>
            {couponValidationResult && (
              <div className="col-span-4 col-start-2 text-sm">
                {couponValidationResult.isValid ? (
                  <p className="text-green-600">
                    Cupom válido! Desconto: R$ {Number(couponValidationResult.discountAmount).toFixed(2)}
                  </p>
                ) : (
                  <p className="text-red-600">Cupom inválido: {couponValidationResult.reason}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor Original
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={Number(formData.amount).toFixed(2)}
                readOnly
                className="col-span-3 bg-gray-100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discountAmount" className="text-right">
                Desconto
              </Label>
              <Input
                id="discountAmount"
                type="number"
                step="0.01"
                value={Number(formData.discountAmount).toFixed(2)}
                readOnly
                className="col-span-3 bg-gray-100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="finalAmount" className="text-right">
                Valor Final
              </Label>
              <Input
                id="finalAmount"
                type="number"
                step="0.01"
                value={Number(formData.finalAmount).toFixed(2)}
                readOnly
                className="col-span-3 font-bold text-lg bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
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
                  <SelectItem value="paid">Pago</SelectItem>
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
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="in_route">Em Rota</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
