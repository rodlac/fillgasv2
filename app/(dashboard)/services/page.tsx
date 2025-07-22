"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit } from "lucide-react"
import { ServiceModal } from "@/components/service-modal"
import { useToast } from "@/hooks/use-toast"

interface Service {
  id: string
  name: string
  price: number
  isActive: boolean
  createdAt: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const { toast } = useToast()

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data.filter((service: Service) => service.name.toLowerCase().includes(search.toLowerCase())))
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [search])

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedService(null)
    fetchServices()
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600">Gerencie os serviços oferecidos</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar serviços..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {service.price.toFixed(2)}</div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ServiceModal open={showModal} onClose={handleModalClose} service={selectedService} />
    </div>
  )
}
