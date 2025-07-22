"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  price: number
}

interface BookingService {
  serviceId: string
  quantity: number
}

interface Booking {
  id: string
  clientId: string
  deliveryAddress: string
  deliveryDate: string
  paymentMethod: string
  status: string
  totalPrice: number
  discountAmount?: number
  couponId?: string
  bookingServices: Array<{
    id?: string // Optional for new bookings
    serviceId: string
    quantity: number
    service?: Service // Optional for new bookings, but present when fetched
  }>
}

interface BookingModalProps {
  open: boolean
  onClose: () => void
  booking: Booking | null
}

export function BookingModal({ open, onClose, booking }: BookingModalProps) {
  const [formData, setFormData] = useState<Partial<Booking>>({})
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [clientsRes, servicesRes] = await Promise.all([fetch("/api/clients"), fetch("/api/services")])

        const clientsData = await clientsRes.json()
        const servicesData = await servicesRes.json()

        setClients(clientsData.clients || [])
        setServices(servicesData || [])
      } catch (error) {
        console.error("Failed to fetch initial data:", error)
        toast({
          title: "Erro",
          description: "Erro ao carregar dados iniciais para o agendamento",
          variant: "destructive",
        })
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (booking) {
      setFormData({
        ...booking,
        deliveryDate: booking.deliveryDate.split("T")[0], // Format date for input type="date"
        bookingServices: booking.bookingServices.map((bs) => ({
          serviceId: bs.serviceId,
          quantity: bs.quantity,
        })),
      })
    } else {
      setFormData({
        deliveryDate: new Date().toISOString().split("T")[0],
        paymentMethod: "PIX",
        status: "PENDING",
        bookingServices: [{ serviceId: "", quantity: 1 }],
      })
    }
  }, [booking])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, deliveryDate: date ? format(date, "yyyy-MM-dd") : "" }))
  }

  const handleServiceChange = (index: number, field: keyof BookingService, value: string | number) => {
    const updatedServices = [...(formData.bookingServices || [])]
    if (field === "quantity") {
      updatedServices[index][field] = Number(value)
    } else {
      updatedServices[index][field] = value as string
    }
    setFormData((prev) => ({ ...prev, bookingServices: updatedServices }))
  }

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      bookingServices: [...(prev.bookingServices || []), { serviceId: "", quantity: 1 }],
    }))
  }

  const removeService = (index: number) => {
    const updatedServices = (formData.bookingServices || []).filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, bookingServices: updatedServices }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const method = booking ? "PUT" : "POST"
      const url = booking ? `/api/bookings/${booking.id}` : "/api/bookings"

      // Filter out empty service entries
      const servicesToSubmit = formData.bookingServices?.filter((bs) => bs.serviceId && bs.quantity > 0)

      const payload = {
        ...formData,
        bookingServices: servicesToSubmit,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar agendamento")
      }

      toast({
        title: "Sucesso",
        description: `Agendamento ${booking ? "atualizado" : "criado"} com sucesso!`,
      })
      onClose()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{booking ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientId" className="text-right">
              Cliente
            </Label>
            <Select
              value={formData.clientId || ""}
              onValueChange={(value) => handleSelectChange("clientId", value)}
              required
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
            <Label htmlFor="deliveryAddress" className="text-right">
              Endereço Entrega
            </Label>
            <Input
              id="deliveryAddress"
              value={formData.deliveryAddress || ""}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryDate" className="text-right">
              Data Entrega
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`col-span-3 justify-start text-left font-normal ${
                    !formData.deliveryDate && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deliveryDate ? format(new Date(formData.deliveryDate), "PPP") : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.deliveryDate ? new Date(formData.deliveryDate) : undefined}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentMethod" className="text-right">
              Método Pagamento
            </Label>
            <Select
              value={formData.paymentMethod || ""}
              onValueChange={(value) => handleSelectChange("paymentMethod", value)}
              required
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                <SelectItem value="BANK_TRANSFER">Transferência Bancária</SelectItem>
                <SelectItem value="CASH">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Serviços</h3>
            {(formData.bookingServices || []).map((bs, index) => (
              <div key={index} className="grid grid-cols-6 items-center gap-2 mb-2">
                <Select
                  value={bs.serviceId || ""}
                  onValueChange={(value) => handleServiceChange(index, "serviceId", value)}
                  className="col-span-4"
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} (R$ {Number(service.price).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={bs.quantity}
                  onChange={(e) => handleServiceChange(index, "quantity", e.target.value)}
                  className="col-span-1"
                  min="1"
                  required
                />
                <Button variant="ghost" size="icon" onClick={() => removeService(index)} className="col-span-1">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addService} className="mt-2 bg-transparent">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Serviço
            </Button>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="couponId" className="text-right">
              Cupom ID
            </Label>
            <Input id="couponId" value={formData.couponId || ""} onChange={handleChange} className="col-span-3" />
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
