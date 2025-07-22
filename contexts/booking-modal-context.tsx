"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
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

interface FormData {
  id?: string // For editing existing bookings
  clientId: string
  bookingDate: Date | undefined
  selectedServiceIds: string[]
  couponCode: string
  paymentMethod: string
  paymentStatus: string
}

interface BookingModalContextType {
  isOpen: boolean
  openModal: (booking?: Booking) => void
  closeModal: () => void
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  clients: Client[]
  services: Service[]
  isLoading: boolean
  isSubmitting: boolean
  isCouponValidating: boolean
  couponDiscount: number
  totalAmount: number
  finalAmount: number
  handleSelectChange: (name: keyof FormData) => (value: string | string[]) => void
  handleDateChange: (date: Date | undefined) => void
  handleCouponCodeChange: (code: string) => void
  validateCoupon: () => Promise<void>
  handleSubmit: (e: React.FormEvent) => Promise<void>
  resetForm: () => void
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined)

const initialFormData: FormData = {
  clientId: "",
  bookingDate: undefined,
  selectedServiceIds: [],
  couponCode: "",
  paymentMethod: "",
  paymentStatus: "",
}

export const BookingModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCouponValidating, setIsCouponValidating] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [finalAmount, setFinalAmount] = useState(0)

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [clientsRes, servicesRes] = await Promise.all([fetch("/api/clients"), fetch("/api/services")])

      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()

      setClients(clientsData)
      setServices(servicesData)
    } catch (error) {
      console.error("Failed to fetch initial data:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar dados iniciais para o agendamento.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  useEffect(() => {
    const calculatedTotal = formData.selectedServiceIds.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId)
      return sum + (service?.price || 0)
    }, 0)
    setTotalAmount(calculatedTotal)
    setFinalAmount(calculatedTotal - couponDiscount)
  }, [formData.selectedServiceIds, services, couponDiscount])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setCouponDiscount(0)
    setTotalAmount(0)
    setFinalAmount(0)
  }, [])

  const openModal = useCallback(
    (booking?: Booking) => {
      if (booking) {
        setFormData({
          id: booking.id,
          clientId: booking.clientId,
          bookingDate: new Date(booking.bookingDate),
          selectedServiceIds: booking.services.map((s) => s.id),
          couponCode: booking.coupon?.code || "",
          paymentMethod: booking.paymentMethod,
          paymentStatus: booking.paymentStatus,
        })
        setCouponDiscount(booking.discountAmount)
        setTotalAmount(booking.amount)
        setFinalAmount(booking.finalAmount)
      } else {
        resetForm()
      }
      setIsOpen(true)
    },
    [resetForm],
  )

  const closeModal = useCallback(() => {
    setIsOpen(false)
    resetForm()
  }, [resetForm])

  const handleSelectChange = useCallback(
    (name: keyof FormData) => (value: string | string[]) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [],
  )

  const handleDateChange = useCallback((date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      bookingDate: date,
    }))
  }, [])

  const handleCouponCodeChange = useCallback(
    (code: string) => {
      setFormData((prev) => ({
        ...prev,
        couponCode: code,
      }))
      if (!code) {
        setCouponDiscount(0)
        setFinalAmount(totalAmount)
      }
    },
    [totalAmount],
  )

  const validateCoupon = useCallback(async () => {
    if (!formData.couponCode) {
      setCouponDiscount(0)
      setFinalAmount(totalAmount)
      return
    }

    setIsCouponValidating(true)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.couponCode, amount: totalAmount }),
      })
      const data = await res.json()

      if (res.ok) {
        setCouponDiscount(data.discountAmount)
        setFinalAmount(data.finalAmount)
        toast({
          title: "Sucesso",
          description: `Cupom aplicado! Desconto de R$ ${data.discountAmount.toFixed(2)}.`,
        })
      } else {
        setCouponDiscount(0)
        setFinalAmount(totalAmount)
        toast({
          title: "Erro ao validar cupom",
          description: data.error || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating coupon:", error)
      setCouponDiscount(0)
      setFinalAmount(totalAmount)
      toast({
        title: "Erro",
        description: "Falha na comunicação com o servidor para validar cupom.",
        variant: "destructive",
      })
    } finally {
      setIsCouponValidating(false)
    }
  }, [formData.couponCode, totalAmount])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      const payload = {
        clientId: formData.clientId,
        bookingDate: formData.bookingDate?.toISOString(),
        serviceIds: formData.selectedServiceIds,
        couponCode: formData.couponCode || null,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        amount: totalAmount,
        discountAmount: couponDiscount,
        finalAmount: finalAmount,
      }

      try {
        const method = formData.id ? "PUT" : "POST"
        const url = formData.id ? `/api/bookings/${formData.id}` : "/api/bookings"

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (res.ok) {
          toast({
            title: "Sucesso",
            description: `Agendamento ${formData.id ? "atualizado" : "criado"} com sucesso!`,
          })
          closeModal()
          // Optionally, trigger a refresh of the bookings list in the parent component
          // For now, we'll rely on the user refreshing or navigating.
        } else {
          toast({
            title: "Erro",
            description: data.error || `Falha ao ${formData.id ? "atualizar" : "criar"} agendamento.`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error submitting booking:", error)
        toast({
          title: "Erro",
          description: `Falha na comunicação com o servidor ao ${formData.id ? "atualizar" : "criar"} agendamento.`,
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, totalAmount, couponDiscount, finalAmount, closeModal],
  )

  const contextValue = {
    isOpen,
    openModal,
    closeModal,
    formData,
    setFormData,
    clients,
    services,
    isLoading,
    isSubmitting,
    isCouponValidating,
    couponDiscount,
    totalAmount,
    finalAmount,
    handleSelectChange,
    handleDateChange,
    handleCouponCodeChange,
    validateCoupon,
    handleSubmit,
    resetForm,
  }

  return <BookingModalContext.Provider value={contextValue}>{children}</BookingModalContext.Provider>
}

export const useBookingModal = () => {
  const context = useContext(BookingModalContext)
  if (context === undefined) {
    throw new Error("useBookingModal must be used within a BookingModalProvider")
  }
  return context
}
