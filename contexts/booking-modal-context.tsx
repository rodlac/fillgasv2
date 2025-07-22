"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
  email: string
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
  id?: string
  clientId: string
  client?: Client
  deliveryAddress: string
  deliveryDate: string
  status: string
  amount: number
  discountAmount: number
  paymentMethod: string
  paymentStatus: string
  couponId: string | null
  coupon?: Coupon | null
  serviceIds: string[]
  services?: Service[]
  notes?: string
}

interface CouponValidationResult {
  isValid: boolean
  discountAmount?: number
  reason?: string
  coupon?: { id: string; code: string; name: string }
}

interface BookingModalContextType {
  // Form state
  clientId: string
  setClientId: (value: string) => void
  deliveryAddress: string
  setDeliveryAddress: (value: string) => void
  deliveryDate: string
  setDeliveryDate: (value: string) => void
  status: string
  setStatus: (value: string) => void
  amount: number
  setAmount: (value: number) => void
  discountAmount: number
  setDiscountAmount: (value: number) => void
  paymentMethod: string
  setPaymentMethod: (value: string) => void
  paymentStatus: string
  setPaymentStatus: (value: string) => void
  couponId: string | null
  setCouponId: (value: string | null) => void
  serviceIds: string[]
  setServiceIds: (value: string[]) => void
  notes: string
  setNotes: (value: string) => void

  // Data state
  clients: Client[]
  services: Service[]
  coupons: Coupon[]

  // UI state
  loading: boolean
  setLoading: (value: boolean) => void
  selectedCouponCode: string
  setSelectedCouponCode: (value: string) => void
  couponValidationResult: CouponValidationResult | null
  setCouponValidationResult: (value: CouponValidationResult | null) => void

  // Actions
  resetForm: () => void
  loadBooking: (booking: Booking) => void
  fetchInitialData: () => Promise<void>
  validateCoupon: () => Promise<void>
  toggleService: (serviceId: string) => void
  calculateFinalAmount: () => number
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined)

export function useBookingModal() {
  const context = useContext(BookingModalContext)
  if (context === undefined) {
    throw new Error("useBookingModal must be used within a BookingModalProvider")
  }
  return context
}

interface BookingModalProviderProps {
  children: ReactNode
}

export function BookingModalProvider({ children }: BookingModalProviderProps) {
  const { toast } = useToast()

  // Form state
  const [clientId, setClientId] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString())
  const [status, setStatus] = useState("scheduled")
  const [amount, setAmount] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("pix")
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [couponId, setCouponId] = useState<string | null>(null)
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  // Data state
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [selectedCouponCode, setSelectedCouponCode] = useState("")
  const [couponValidationResult, setCouponValidationResult] = useState<CouponValidationResult | null>(null)

  const resetForm = () => {
    console.log("Resetting form to initial state")
    setClientId("")
    setDeliveryAddress("")
    setDeliveryDate(new Date().toISOString())
    setStatus("scheduled")
    setAmount(0)
    setDiscountAmount(0)
    setPaymentMethod("pix")
    setPaymentStatus("pending")
    setCouponId(null)
    setServiceIds([])
    setNotes("")
    setSelectedCouponCode("")
    setCouponValidationResult(null)
  }

  const loadBooking = (booking: Booking) => {
    console.log("Loading booking into form:", booking)
    setClientId(booking.clientId)
    setDeliveryAddress(booking.deliveryAddress)
    setDeliveryDate(new Date(booking.deliveryDate).toISOString())
    setStatus(booking.status)
    setAmount(Number(booking.amount))
    setDiscountAmount(Number(booking.discountAmount))
    setPaymentMethod(booking.paymentMethod)
    setPaymentStatus(booking.paymentStatus)
    setCouponId(booking.couponId)
    setServiceIds(booking.services?.map((s) => s.id) || [])
    setNotes(booking.notes || "")
    setSelectedCouponCode(booking.coupon?.code || "")

    if (booking.coupon) {
      setCouponValidationResult({
        isValid: true,
        discountAmount: Number(booking.discountAmount),
        coupon: {
          id: booking.coupon.id,
          code: booking.coupon.code,
          name: booking.coupon.name,
        },
      })
    }
  }

  const fetchInitialData = async () => {
    try {
      console.log("Fetching initial data...")
      const [clientsRes, servicesRes, couponsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/services"),
        fetch("/api/coupons"),
      ])

      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()
      const couponsData = await couponsRes.json()

      console.log("Clients data:", clientsData)
      console.log("Services data:", servicesData)
      console.log("Coupons data:", couponsData)

      setClients(Array.isArray(clientsData) ? clientsData : clientsData.clients || [])
      setServices(Array.isArray(servicesData) ? servicesData : [])
      setCoupons(Array.isArray(couponsData) ? couponsData : [])
    } catch (error) {
      console.error("Failed to fetch initial data:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar dados iniciais para o agendamento.",
        variant: "destructive",
      })
    }
  }

  const validateCoupon = async () => {
    if (!selectedCouponCode || !clientId) {
      setCouponValidationResult({ isValid: false, reason: "Código do cupom e cliente são obrigatórios." })
      return
    }
    setLoading(true)
    try {
      console.log("Validating coupon:", {
        code: selectedCouponCode,
        clientId: clientId,
        orderAmount: amount,
      })
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: selectedCouponCode,
          clientId: clientId,
          orderAmount: amount,
        }),
      })
      const data = await res.json()
      console.log("Coupon validation result:", data)
      setCouponValidationResult(data)
      if (data.isValid) {
        setCouponId(data.coupon.id)
        toast({ title: "Sucesso", description: "Cupom validado com sucesso!" })
      } else {
        toast({ title: "Erro", description: `Cupom inválido: ${data.reason}`, variant: "destructive" })
      }
    } catch (error) {
      console.error("Error validating coupon:", error)
      toast({ title: "Erro", description: "Falha ao validar cupom.", variant: "destructive" })
      setCouponValidationResult({ isValid: false, reason: "Erro na validação do cupom." })
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (serviceId: string) => {
    setServiceIds((prev) => {
      const newServiceIds = prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
      console.log("Updated service IDs:", newServiceIds)
      return newServiceIds
    })
  }

  const calculateFinalAmount = () => {
    return Math.max(0, amount - discountAmount)
  }

  // Calculate amount based on selected services
  useEffect(() => {
    const selectedServices = services.filter((s) => serviceIds.includes(s.id))
    const totalAmount = selectedServices.reduce((sum, service) => sum + Number(service.price), 0)
    console.log("Calculating amount for services:", selectedServices, "Total:", totalAmount)
    setAmount(totalAmount)
  }, [serviceIds, services])

  // Apply coupon discount
  useEffect(() => {
    let discount = 0
    if (couponValidationResult?.isValid && couponValidationResult.discountAmount !== undefined) {
      discount = couponValidationResult.discountAmount
    }
    console.log("Applying discount:", discount)
    setDiscountAmount(discount)
  }, [amount, couponValidationResult])

  const value: BookingModalContextType = {
    // Form state
    clientId,
    setClientId,
    deliveryAddress,
    setDeliveryAddress,
    deliveryDate,
    setDeliveryDate,
    status,
    setStatus,
    amount,
    setAmount,
    discountAmount,
    setDiscountAmount,
    paymentMethod,
    setPaymentMethod,
    paymentStatus,
    setPaymentStatus,
    couponId,
    setCouponId,
    serviceIds,
    setServiceIds,
    notes,
    setNotes,

    // Data state
    clients,
    services,
    coupons,

    // UI state
    loading,
    setLoading,
    selectedCouponCode,
    setSelectedCouponCode,
    couponValidationResult,
    setCouponValidationResult,

    // Actions
    resetForm,
    loadBooking,
    fetchInitialData,
    validateCoupon,
    toggleService,
    calculateFinalAmount,
  }

  return <BookingModalContext.Provider value={value}>{children}</BookingModalContext.Provider>
}
