"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

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
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minimumAmount?: number | null
}

interface Booking {
  id: string
  clientId: string
  client: Client
  bookingDate: string
  deliveryAddress: string
  status: string
  totalAmount: number
  discountAmount?: number | null
  finalAmount: number
  services: Service[]
  couponId?: string | null
  coupon?: Coupon | null
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  booking: Booking | null
}

export function BookingModal({ isOpen, onClose, onSave, booking }: BookingModalProps) {
  const [formData, setFormData] = useState<
    Omit<Booking, "id" | "client" | "services" | "coupon" | "payment"> & {
      client: Client | null
      services: Service[]
    }
  >({
    clientId: "",
    client: null,
    bookingDate: "",
    deliveryAddress: "",
    status: "PENDING",
    totalAmount: 0,
    discountAmount: null,
    finalAmount: 0,
    services: [],
    couponId: null,
  })
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
    fetchServices()
    fetchCoupons()
  }, [])

  useEffect(() => {
    if (booking) {
      setFormData({
        ...booking,
        clientId: booking.client.id,
        totalAmount: Number(booking.totalAmount),
        discountAmount: booking.discountAmount ? Number(booking.discountAmount) : null,
        finalAmount: Number(booking.finalAmount),
        bookingDate: new Date(booking.bookingDate).toISOString().split("T")[0],
        couponId: booking.coupon?.id || null,
      })
    } else {
      setFormData({
        clientId: "",
        client: null,
        bookingDate: "",
        deliveryAddress: "",
        status: "PENDING",
        totalAmount: 0,
        discountAmount: null,
        finalAmount: 0,
        services: [],
        couponId: null,
      })
    }
  }, [booking, isOpen])

  useEffect(() => {
    // Calculate total and final amount whenever services or coupon change
    const currentTotal = formData.services.reduce((sum, service) => sum + Number(service.price), 0)
    let currentFinal = currentTotal
    let currentDiscount = 0

    if (formData.couponId) {
      const selectedCoupon = coupons.find((c) => c.id === formData.couponId)
      if (selectedCoupon) {
        if (selectedCoupon.minimumAmount && currentTotal < selectedCoupon.minimumAmount) {
          // Coupon not applicable due to minimum amount
          currentDiscount = 0
        } else if (selectedCoupon.discountType === "PERCENTAGE") {
          currentDiscount = currentTotal * (Number(selectedCoupon.discountValue) / 100)
        } else {
          currentDiscount = Number(selectedCoupon.discountValue)
        }
        currentFinal = currentTotal - currentDiscount
      }
    }

    setFormData((prev) => ({
      ...prev,
      totalAmount: currentTotal,
      discountAmount: currentDiscount,
      finalAmount: Math.max(0, currentFinal), // Final amount cannot be negative
    }))
  }, [formData.services, formData.couponId, coupons])

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients")
      const data = await res.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services")
      const data = await res.json()
      setServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons")
      const data = await res.json()
      setCoupons(data || [])
    } catch (error) {
      console.error("Error fetching coupons:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find((c) => c.id === clientId)
    setFormData((prev) => ({
      ...prev,
      clientId,
      client: selectedClient || null,
    }))
  }

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => {
      const isSelected = prev.services.some((s) => s.id === serviceId)
      const serviceToToggle = services.find((s) => s.id === serviceId)

      if (!serviceToToggle) return prev

      if (isSelected) {
        return {
          ...prev,
          services: prev.services.filter((s) => s.id !== serviceId),
        }
      } else {
        return {
          ...prev,
          services: [...prev.services, serviceToToggle],
        }
      }
    })
  }

  const handleCouponSelect = (couponId: string) => {
    setFormData((prev) => ({ ...prev, couponId: couponId === "" ? null : couponId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = booking ? "PUT" : "POST"
      const url = booking ? `/api/bookings/${booking.id}` : "/api/bookings"

      const payload = {
        ...formData,
        clientId: formData.client?.id, // Ensure clientId is sent
        services: formData.services.map((s) => ({ id: s.id })), // Send only service IDs
        couponId: formData.couponId || null,
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Failed to ${booking ? "update" : "create"} booking`)
      }

      toast({
        title: "Sucesso!",
        description: `Agendamento ${booking ? "atualizado" : "criado"} com sucesso.`,
      })
      onSave()
    } catch (error) {
      console.error("Error saving booking:", error)
      toast({
        title: "Erro",
        description: `Falha ao ${booking ? "atualizar" : "criar"} agendamento.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{booking ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientId" className="text-right">
                Cliente
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={handleClientSelect}
                disabled={!!booking} // Disable client selection on edit
              >
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
                Data do Agendamento
              </Label>
              <Input
                id="bookingDate"
                type="date"
                value={formData.bookingDate}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deliveryAddress" className="text-right">
                Endereço de Entrega
              </Label>
              <Input
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Serviços</Label>
              <div className="col-span-3 space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.services.some((s) => s.id === service.id)}
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
              <Label htmlFor="couponId" className="text-right">
                Cupom
              </Label>
              <Select
                value={formData.couponId || "none"} // Updated default value to be a non-empty string
                onValueChange={handleCouponSelect}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um cupom (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {coupons.map((coupon) => (
                    <SelectItem key={coupon.id} value={coupon.id}>
                      {coupon.code} (
                      {coupon.discountType === "PERCENTAGE"
                        ? `${Number(coupon.discountValue).toFixed(0)}%`
                        : `R$ ${Number(coupon.discountValue).toFixed(2)}`}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Valor Total</Label>
              <Input value={`R$ ${Number(formData.totalAmount).toFixed(2)}`} className="col-span-3" readOnly />
            </div>
            {formData.discountAmount !== null && formData.discountAmount > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Desconto</Label>
                <Input value={`R$ ${Number(formData.discountAmount).toFixed(2)}`} className="col-span-3" readOnly />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Valor Final</Label>
              <Input
                value={`R$ ${Number(formData.finalAmount).toFixed(2)}`}
                className="col-span-3 font-bold"
                readOnly
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
