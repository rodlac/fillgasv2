"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Eye, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BookingModalProvider, useBookingModal } from "@/contexts/booking-modal-context"
import BookingModal from "@/components/booking-modal" // Changed to default import
import BookingViewModal from "@/components/booking-view-modal" // Changed to default import
import { toast } from "@/components/ui/use-toast"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  document: string
  address: string
  city: string
  state: string
  zipCode: string
}

interface Service {
  id: string
  name: string
  price: number
}

interface Coupon {
  id: string
  code: string
  name: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minimumAmount: number | null
}

interface Booking {
  id: string
  clientId: string
  client: Client
  bookingDate: string
  status: string
  amount: number
  discountAmount: number
  finalAmount: number
  paymentMethod: string
  paymentStatus: string
  couponId: string | null
  coupon: Coupon | null
  services: Service[]
  createdAt: string
}

function BookingsPageContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null)

  const { openModal } = useBookingModal() // Get openModal from context

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/bookings")
      if (!res.ok) {
        throw new Error("Failed to fetch bookings")
      }
      const data = await res.json()
      setBookings(data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar agendamentos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleViewBooking = useCallback((booking: Booking) => {
    setViewingBooking(booking)
    setIsViewModalOpen(true)
  }, [])

  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false)
    setViewingBooking(null)
  }, [])

  const handleEditBooking = useCallback(
    (booking: Booking) => {
      openModal(booking) // Open modal in edit mode
    },
    [openModal],
  )

  const handleDeleteBooking = useCallback(
    async (id: string) => {
      if (!confirm("Tem certeza que deseja excluir este agendamento?")) {
        return
      }
      try {
        const res = await fetch(`/api/bookings/${id}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          throw new Error("Failed to delete booking")
        }
        toast({
          title: "Sucesso",
          description: "Agendamento excluído com sucesso.",
        })
        fetchBookings() // Refresh list
      } catch (error) {
        console.error("Error deleting booking:", error)
        toast({
          title: "Erro",
          description: "Falha ao excluir agendamento.",
          variant: "destructive",
        })
      }
    },
    [fetchBookings],
  )

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "in_route":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "refunded":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col sm:gap-4 sm:py-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Agendamentos</CardTitle>
          <Button onClick={() => openModal()} size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Novo Agendamento</span>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando agendamentos...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum agendamento encontrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Valor Final</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id.substring(0, 8)}</TableCell>
                    <TableCell>{booking.client.name}</TableCell>
                    <TableCell>{format(new Date(booking.bookingDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>{booking.services.map((s) => s.name).join(", ") || "Nenhum"}</TableCell>
                    <TableCell>R$ {Number(booking.finalAmount).toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteBooking(booking.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <BookingModal />
      <BookingViewModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} booking={viewingBooking} />
    </div>
  )
}

export default function BookingsPageWrapper() {
  return (
    <BookingModalProvider>
      <BookingsPageContent />
    </BookingModalProvider>
  )
}
