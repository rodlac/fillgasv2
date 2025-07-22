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
  client: {
    name: string
  }
  deliveryAddress: string
  deliveryDate: string
  paymentMethod: string
  status: string
  totalPrice: number
  discountAmount?: number
  couponId?: string
  bookingServices: Array<{
    id: string
    quantity: number
    service: {
      id: string
      name: string
      price: number
    }
  }>
  payments: Array<{
    id: string
    amount: number
    finalAmount: number
    status: string
  }>
  createdAt: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showBookingViewModal, setShowBookingViewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const { toast } = useToast()

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/bookings?search=${search}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setBookings(data.bookings || []) // Ensure it's always an array
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive",
      })
      setBookings([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [search])

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowBookingModal(true)
  }

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowBookingViewModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Sucesso",
          description: "Agendamento excluído com sucesso",
        })
        fetchBookings()
      } catch (error) {
        console.error("Failed to delete booking:", error)
        toast({
          title: "Erro",
          description: "Erro ao excluir agendamento",
          variant: "destructive",
        })
      }
    }
  }

  const handleBookingModalClose = () => {
    setShowBookingModal(false)
    setSelectedBooking(null)
    fetchBookings()
  }

  const handleBookingViewModalClose = () => {
    setShowBookingViewModal(false)
    setSelectedBooking(null)
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Gerencie todos os agendamentos de entrega</p>
        </div>
        <Button onClick={() => setShowBookingModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por cliente ou endereço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Data de Entrega</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.client.name}</TableCell>
                  <TableCell>{booking.deliveryAddress}</TableCell>
                  <TableCell>{new Date(booking.deliveryDate).toLocaleDateString()}</TableCell>
                  <TableCell>R$ {Number(booking.totalPrice).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{booking.status}</Badge>
                  </TableCell>
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

      <BookingModal open={showBookingModal} onClose={handleBookingModalClose} booking={selectedBooking} />
      <BookingViewModal open={showBookingViewModal} onClose={handleBookingViewModalClose} booking={selectedBooking} />
    </div>
  )
}
