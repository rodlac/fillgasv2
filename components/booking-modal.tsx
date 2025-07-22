"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface BookingModalProps {
  open: boolean
  onClose: () => void
  booking?: any
}

export function BookingModal({ open, onClose, booking }: BookingModalProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [formData, setFormData] = useState({
    clientId: "",
    deliveryAddress: "",
    deliveryDate: "",
    paymentMethod: "",
    services: [{ serviceId: "", quantity: 1 }],
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchClients()
      fetchServices()
      if (booking) {
        setFormData({
          clientId: booking.clientId || "",
          deliveryAddress: booking.deliveryAddress || "",
          deliveryDate: booking.deliveryDate?.split("T")[0] || "",
          paymentMethod: booking.paymentMethod || "",
          services: booking.bookingServices?.map((bs: any) => ({
            serviceId: bs.serviceId,
            quantity: bs.quantity,
          })) || [{ serviceId: "", quantity: 1 }],
        })
      } else {
        setFormData({
          clientId: "",
          deliveryAddress: "",
          deliveryDate: "",
          paymentMethod: "",
          services: [{ serviceId: "", quantity: 1 }],
        })
      }
    }
  }, [open, booking])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      const data = await response.json()
      setClients(data.clients)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = booking ? `/api/bookings/${booking.id}` : "/api/bookings"
      const method = booking ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Agendamento ${booking ? "atualizado" : "criado"} com sucesso`,
        })
        onClose()
      } else {
        throw new Error("Erro ao salvar agendamento")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar agendamento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { serviceId: "", quantity: 1 }],
    }))
  }

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }))
  }

  const updateService = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service, i) => (i === index ? { ...service, [field]: value } : service)),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{booking ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Data de Entrega</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, deliveryDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Endereço de Entrega</Label>
            <Textarea
              id="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData((prev) => ({ ...prev, deliveryAddress: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="BANK_TRANSFER">Transferência Bancária</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Serviços</Label>
            {formData.services.map((service, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select value={service.serviceId} onValueChange={(value) => updateService(index, "serviceId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((svc: any) => (
                        <SelectItem key={svc.id} value={svc.id}>
                          {svc.name} - R$ {Number(svc.price).toFixed(2)} {/* Ensure price is number */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    value={service.quantity}
                    onChange={(e) => updateService(index, "quantity", Number.parseInt(e.target.value))}
                  />
                </div>
                {formData.services.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeService(index)}>
                    Remover
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addService}>
              Adicionar Serviço
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
