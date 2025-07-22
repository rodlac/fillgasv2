"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search } from "lucide-react"
import { ServiceModal } from "@/components/service-modal"

interface Service {
  id: string
  name: string
  price: number
  description?: string
  isActive: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services")
      if (!res.ok) {
        throw new Error("Failed to fetch services")
      }
      const data = await res.json()
      setServices(data || []) // Ensure it's an array
    } catch (error) {
      console.error("Error fetching services:", error)
      setServices([]) // Set to empty array on error
    }
  }

  const filteredServices = services.filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleNewService = () => {
    setSelectedService(null)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    await fetchServices()
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Serviços</h1>
        <Button onClick={handleNewService}>
          <PlusCircle className="mr-2 h-5 w-5" /> Novo Serviço
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome do serviço..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card key={service.id} className="flex flex-col justify-between p-4">
                <div>
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <p className="text-2xl font-bold text-primary">R$ {Number(service.price).toFixed(2)}</p>
                  {service.description && <p className="text-sm text-gray-500">{service.description}</p>}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant={service.isActive ? "default" : "destructive"}>
                    {service.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button variant="outline" onClick={() => handleEdit(service)}>
                    Editar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        service={selectedService}
      />
    </div>
  )
}
