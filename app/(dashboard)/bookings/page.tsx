"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search } from "lucide-react"
import { BookingModal } from "@/components/booking-modal"
import { BookingViewModal } from "@/components/booking-view-modal"

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
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
}

interface Payment {
  id: string
  amount: number
  status: string
}

interface Booking {
  id: string
  clientId: string
  client: Client
  bookingDate: string
  deliveryAddress: string
  status: string
  totalAmount: number
  discountAmount?: number | null
  finalAmount: number
  services: Service[]
  coupon?: Coupon | null
  payment?: Payment | null
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings")
      if (!res.ok) {
        throw new Error("Failed to fetch bookings")
      }
      const data = await res.json()
      setBookings(data || []) // Ensure it's an array
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setBookings([]) // Set to empty array on error
    }
  }

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsViewModalOpen(true)
  }

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsCreateModalOpen(true)
  }

  const handleNewBooking = () => {
    setSelectedBooking(null)
    setIsCreateModalOpen(true)
  }

  const handleSave = async () => {
    await fetchBookings()
    setIsCreateModalOpen(false)
    setIsViewModalOpen(false)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary"
      case "CONFIRMED":
        return "default"
      case "IN_ROUTE":
        return "outline"
      case "DELIVERED":
        return "success"
      case "CANCELED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        <Button onClick={handleNewBooking}>
          <PlusCircle className="mr-2 h-5 w-5" /> Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por cliente ou endereço..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Valor Final</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.client.name}</TableCell>
                    <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.deliveryAddress}</TableCell>
                    <TableCell>{booking.services.map((s) => s.name).join(", ")}</TableCell>
                    <TableCell>R$ {Number(booking.finalAmount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleView(booking)} className="mr-2">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(booking)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <BookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSave}
        booking={selectedBooking}
      />
      <BookingViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        booking={selectedBooking}
        onEdit={() => {
          setIsViewModalOpen(false)
          setIsCreateModalOpen(true)
        }}
        onUpdateStatus={handleSave} // Refresh data after status update
      />
    </div>
  )
}
