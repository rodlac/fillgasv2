"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookingModal } from "@/components/booking-modal"
import { BookingViewModal } from "@/components/booking-view-modal"
import { PlusIcon, SearchIcon, EyeIcon, PencilIcon, TrashIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Client {
  id: string
  name: string
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/bookings")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setBookings(data || []) // Ensure it's an array
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar agendamentos.",
        variant: "destructive",
      })
      setBookings([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleNewBooking = () => {
    setEditingBooking(null)
    setIsCreateModalOpen(true)
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setIsCreateModalOpen(true)
  }

  const handleViewBooking = (booking: Booking) => {
    setViewingBooking(booking)
    setIsViewModalOpen(true)
  }

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      return
    }
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso.",
      })
      fetchBookings()
    } catch (error) {
      console.error("Failed to delete booking:", error)
      toast({
        title: "Erro",
        description: "Falha ao excluir agendamento.",
        variant: "destructive",
      })
    }
  }

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false)
    setEditingBooking(null)
    fetchBookings() // Refresh bookings after modal close
  }

  const handleViewModalClose = () => {
    setIsViewModalOpen(false)
    setViewingBooking(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Carregando agendamentos...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Agendamentos</h1>
        <Button onClick={handleNewBooking}>
          <PlusIcon className="mr-2 h-4 w-4" /> Novo Agendamento
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por cliente ou ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="in_route">Em Rota</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor Final</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id.substring(0, 8)}...</TableCell>
                  <TableCell>{booking.client.name}</TableCell>
                  <TableCell>{format(new Date(booking.bookingDate), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "in_route"
                              ? "bg-purple-100 text-purple-800"
                              : booking.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell>R$ {Number(booking.finalAmount).toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewBooking(booking)}>
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditBooking(booking)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBooking(booking.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isCreateModalOpen && (
        <BookingModal isOpen={isCreateModalOpen} onClose={handleCreateModalClose} booking={editingBooking} />
      )}
      {isViewModalOpen && (
        <BookingViewModal isOpen={isViewModalOpen} onClose={handleViewModalClose} booking={viewingBooking} />
      )}
    </div>
  )
}
