"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
import { BookingModalProvider, useBookingModal } from "@/contexts/booking-modal-context"
import BookingModal from "@/components/booking-modal"
import BookingViewModal from "@/components/booking-view-modal"
import { toast } from "sonner"

interface Booking {
  id: string
  client: {
    name: string
    email: string
  }
  service: {
    name: string
    price: number
  }
  scheduledDate: string
  scheduledTime: string
  status: string
  address: string
  notes?: string
  couponCode?: string
  totalAmount: number
}

function BookingsPageContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const { openModal } = useBookingModal()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        toast.error("Erro ao carregar agendamentos")
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Erro ao carregar agendamentos")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Agendamento excluído com sucesso!")
        fetchBookings()
      } else {
        toast.error("Erro ao excluir agendamento")
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast.error("Erro ao excluir agendamento")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendente"
      case "CONFIRMED":
        return "Confirmado"
      case "IN_PROGRESS":
        return "Em Andamento"
      case "COMPLETED":
        return "Concluído"
      case "CANCELLED":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking)
    setViewModalOpen(true)
  }

  const handleEdit = (booking: Booking) => {
    openModal(booking)
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie todos os agendamentos de serviços</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
          <CardDescription>Visualize e gerencie todos os agendamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.client.name}</div>
                      <div className="text-sm text-muted-foreground">{booking.client.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{booking.service.name}</TableCell>
                  <TableCell>
                    <div>
                      <div>{new Date(booking.scheduledDate).toLocaleDateString("pt-BR")}</div>
                      <div className="text-sm text-muted-foreground">{booking.scheduledTime}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                  </TableCell>
                  <TableCell>R$ {booking.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(booking)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(booking)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(booking.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BookingModal />
      <BookingViewModal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} booking={selectedBooking} />
    </div>
  )
}

export default function BookingsPage() {
  return (
    <BookingModalProvider>
      <BookingsPageContent />
    </BookingModalProvider>
  )
}
