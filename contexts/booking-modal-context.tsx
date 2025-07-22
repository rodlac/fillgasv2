"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface Service {
  id: string
  name: string
  price: number
  category: string
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
}

interface FormData {
  clientId: string
  serviceIds: string[]
  deliveryAddress: string
  deliveryDate: string
  status: string
  paymentStatus: string
  paymentMethod: string
  couponCode: string
  notes: string
}

interface BookingModalContextType {
  isOpen: boolean
  formData: FormData
  clients: Client[]
  services: Service[]
  couponValidation: {
    isValid: boolean
    discountAmount: number
    finalAmount: number
    error?: string
  } | null
  isLoading: boolean
  openModal: (booking?: Booking) => void
  closeModal: () => void
  updateFormData: (field: keyof FormData, value: string | string[]) => void
  validateCoupon: (code: string, amount: number) => Promise<void>
  calculateTotal: () => number
  submitBooking: () => Promise<void>
  fetchData: () => Promise<void>
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined)

const initialFormData: FormData = {
  clientId: "",
  serviceIds: [],
  deliveryAddress: "",
  deliveryDate: "",
  status: "PENDING",
  paymentStatus: "PENDING",
  paymentMethod: "PIX",
  couponCode: "",
  notes: "",
}

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [couponValidation, setCouponValidation] = useState<BookingModalContextType["couponValidation"]>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [clientsRes, servicesRes] = await Promise.all([fetch("/api/clients"), fetch("/api/services")])

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData)
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }, [])

  const openModal = useCallback(
    (booking?: Booking) => {
      if (booking) {
        setEditingBooking(booking)
        setFormData({
          clientId: booking.clientId,
          serviceIds: booking.services.map((s) => s.id),
          deliveryAddress: booking.deliveryAddress,
          deliveryDate: booking.deliveryDate.split("T")[0], // Format for date input
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod,
          couponCode: booking.coupon?.code || "",
          notes: booking.notes || "",
        })
        if (booking.coupon) {
          setCouponValidation({
            isValid: true,
            discountAmount: booking.discountAmount,
            finalAmount: booking.amount - booking.discountAmount,
          })
        }
      } else {
        setEditingBooking(null)
        setFormData(initialFormData)
        setCouponValidation(null)
      }
      setIsOpen(true)
      fetchData()
    },
    [fetchData],
  )

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setFormData(initialFormData)
    setCouponValidation(null)
    setEditingBooking(null)
  }, [])

  const updateFormData = useCallback((field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Reset coupon validation when relevant fields change
    if (field === "serviceIds" || field === "couponCode") {
      setCouponValidation(null)
    }
  }, [])

  const calculateTotal = useCallback(() => {
    return formData.serviceIds.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId)
      return total + (service?.price || 0)
    }, 0)
  }, [formData.serviceIds, services])

  const validateCoupon = useCallback(async (code: string, amount: number) => {
    if (!code.trim()) {
      setCouponValidation(null)
      return
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setCouponValidation({
          isValid: true,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount,
        })
      } else {
        setCouponValidation({
          isValid: false,
          discountAmount: 0,
          finalAmount: amount,
          error: data.error || "Cupom inválido",
        })
      }
    } catch (error) {
      console.error("Error validating coupon:", error)
      setCouponValidation({
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: "Erro ao validar cupom",
      })
    }
  }, [])

  const submitBooking = useCallback(async () => {
    setIsLoading(true)
    try {
      const total = calculateTotal()
      const discountAmount = couponValidation?.discountAmount || 0

      const bookingData = {
        clientId: formData.clientId,
        serviceIds: formData.serviceIds,
        deliveryAddress: formData.deliveryAddress,
        deliveryDate: formData.deliveryDate,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        amount: total,
        discountAmount,
        couponId: couponValidation?.isValid ? couponValidation : null,
        notes: formData.notes,
      }

      const url = editingBooking ? `/api/bookings/${editingBooking.id}` : "/api/bookings"
      const method = editingBooking ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        closeModal()
        // Trigger a refresh of the bookings list
        window.location.reload()
      } else {
        const error = await response.json()
        console.error("Error submitting booking:", error)
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
    } finally {
      setIsLoading(false)
    }
  }, [formData, calculateTotal, couponValidation, editingBooking, closeModal])

  const value: BookingModalContextType = {
    isOpen,
    formData,
    clients,
    services,
    couponValidation,
    isLoading,
    openModal,
    closeModal,
    updateFormData,
    validateCoupon,
    calculateTotal,
    submitBooking,
    fetchData,
  }

  return <BookingModalContext.Provider value={value}>{children}</BookingModalContext.Provider>
}

export function useBookingModal() {
  const context = useContext(BookingModalContext)
  if (context === undefined) {
    throw new Error("useBookingModal must be used within a BookingModalProvider")
  }
  return context
}
