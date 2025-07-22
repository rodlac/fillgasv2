"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Plus } from "lucide-react"
import { BookingModalProvider, useBookingModal } from "@/contexts/booking-modal-context"
import BookingModal from "@/components/booking-modal"
import BookingViewModal from "@/components/booking-view-modal"

interface Service {
  id: string
  name: string
  price: number
  quantity: number
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Coupon {
  id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minimumAmount?: number
}

interface Payment {
  id: string
  method: string
  amount: number
  status: string
  createdAt: string
}

interface Booking {
  id: string
  clientId: string
  client: Client
  deliveryAddress: string
  deliveryDate: string
  status: string
  paymentStatus: string
  paymentMethod: string
  amount: number
  discountAmount: number
  couponId?: string
  coupon?: Coupon
  notes?: string
  services: Service[]
  payments: Payment[]
  createdAt: string
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const paymentStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

function BookingsPageContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

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
        console.error("Failed to fetch bookings")
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBooking = (booking: Booking) => {
    setViewingBooking(booking)
    setIsViewModalOpen(true)
  }

  const handleEditBooking = (booking: Booking) => {
    openModal(booking)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando agendamentos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum agendamento encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data de Entrega</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.client.name}</div>
                        <div className="text-sm text-gray-500">{booking.client.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(booking.deliveryDate)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusColors[booking.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          paymentStatusColors[booking.paymentStatus as keyof typeof paymentStatusColors] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {booking.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {(booking.amount - booking.discountAmount).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewBooking(booking)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditBooking(booking)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <BookingModal />
      <BookingViewModal booking={viewingBooking} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
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
