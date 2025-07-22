"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBookingModal } from "@/contexts/booking-modal-context"
import { toast } from "sonner"

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

export default function BookingModal() {
  const { isOpen, formData, isEditing, closeModal, updateFormData } = useBookingModal()
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchClients()
      fetchServices()
    }
  }, [isOpen])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/bookings/${formData.clientId}` : "/api/bookings"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          serviceId: formData.serviceId,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          address: formData.address,
          notes: formData.notes,
          couponCode: formData.couponCode,
        }),
      })

      if (response.ok) {
        toast.success(isEditing ? "Agendamento atualizado com sucesso!" : "Agendamento criado com sucesso!")
        closeModal()
        window.location.reload() // Refresh the page to show updated data
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao salvar agendamento")
      }
    } catch (error) {
      console.error("Error saving booking:", error)
      toast.error("Erro ao salvar agendamento")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleInputChange("clientId", value)}>
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
            <div className="space-y-2">
              <Label htmlFor="service">Serviço</Label>
              <Select value={formData.serviceId} onValueChange={(value) => handleInputChange("serviceId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Endereço para o serviço"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon">Código do Cupom (opcional)</Label>
            <Input
              id="coupon"
              value={formData.couponCode}
              onChange={(e) => handleInputChange("couponCode", e.target.value)}
              placeholder="Digite o código do cupom"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Observações adicionais"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
