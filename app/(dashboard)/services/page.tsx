"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceModal } from "@/components/service-modal"
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Service {
  id: string
  name: string
  description: string
  price: number
  isActive: boolean
  createdAt: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/services")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setServices(data || []) // Ensure it's an array
    } catch (error) {
      console.error("Failed to fetch services:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar serviços.",
        variant: "destructive",
      })
      setServices([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const filteredServices = services.filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleNewService = () => {
    setEditingService(null)
    setIsModalOpen(true)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) {
      return
    }
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso.",
      })
      fetchServices()
    } catch (error) {
      console.error("Failed to delete service:", error)
      toast({
        title: "Erro",
        description: "Falha ao excluir serviço.",
        variant: "destructive",
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingService(null)
    fetchServices() // Refresh services after modal close
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Carregando serviços...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Serviços</h1>
        <Button onClick={handleNewService}>
          <PlusIcon className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por nome..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <Card key={service.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{service.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditService(service)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">{service.description}</p>
                <p className="text-xl font-bold">R$ {Number(service.price).toFixed(2)}</p>
                <p className={`text-sm ${service.isActive ? "text-green-600" : "text-red-600"}`}>
                  {service.isActive ? "Ativo" : "Inativo"}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center py-8 text-gray-500">Nenhum serviço encontrado.</p>
        )}
      </div>

      {isModalOpen && <ServiceModal isOpen={isModalOpen} onClose={handleModalClose} service={editingService} />}
    </div>
  )
}
