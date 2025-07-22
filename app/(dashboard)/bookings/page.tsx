"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react"
import { BookingModal } from "@/components/booking-modal"
import { BookingViewModal } from "@/components/booking-view-modal"
import { useToast } from "@/hooks/use-toast"

interface Booking {
  id: string
  clientId: string
  client: { name: string }
  deliveryAddress: string
  deliveryDate: string
  paymentMethod: string
  status: string
  totalPrice: number
  createdAt: string
  bookingServices: Array<{
    id: string
    quantity: number
    service: {
      id: string
      name: string
      price: number
    }
  }>
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showCreateEditModal, setShowCreateEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const { toast } = useToast()

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      const data = await response.json()
      setBookings(
        data.filter(
          (booking: Booking) =>
            booking.client.name.toLowerCase().includes(search.toLowerCase()) ||
            booking.deliveryAddress.toLowerCase().includes(search.toLowerCase()),
        ),
      )
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [search])

  const handleCreate = () => {
    setSelectedBooking(null)
    setShowCreateEditModal(true)
  }

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowCreateEditModal(true)
  }

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowViewModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await fetch(`/api/bookings/${id}`, { method: "DELETE" })
        toast({
          title: "Sucesso",
          description: "Agendamento excluído com sucesso",
        })
        fetchBookings()
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir agendamento",
          variant: "destructive",
        })
      }
    }
  }

  const handleModalClose = () => {
    setShowCreateEditModal(false)
    setShowViewModal(false)
    setSelectedBooking(null)
    fetchBookings()
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Gerencie todos os agendamentos de entregas</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar agendamentos por cliente ou endereço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Método Pag.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.client.name}</TableCell>
                  <TableCell>{booking.deliveryAddress}</TableCell>
                  <TableCell>{new Date(booking.deliveryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{booking.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>R$ {Number(booking.totalPrice).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(booking)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(booking)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(booking.id)}>
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

      <BookingModal open={showCreateEditModal} onClose={handleModalClose} booking={selectedBooking} />
      <BookingViewModal open={showViewModal} onClose={handleModalClose} booking={selectedBooking} />
    </div>
  )
}
