"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Service {
  id: string
  name: string
  price: number
  description: string
}

interface Coupon {
  id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minimumAmount: number | null
  validFrom: Date | null
  validUntil: Date | null
  isActive: boolean
}

interface BookingFormData {
  id?: string
  clientId: string
  serviceIds: string[]
  deliveryAddress: string
  deliveryDate: Date | undefined
  deliveryTime: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  paymentStatus: "PENDING" | "PAID" | "REFUNDED"
  paymentMethod: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH"
  couponCode: string
  notes: string
}

interface BookingModalContextType {
  isOpen: boolean
  openModal: (booking?: any) => void
  closeModal: () => void
  formData: BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>
  clients: Client[]
  services: Service[]
  isLoading: boolean
  isSubmitting: boolean
  errors: Record<string, string>
  subtotal: number
  discountAmount: number
  totalAmount: number
  handleServiceToggle: (serviceId: string) => void
  handleCouponCodeChange: (code: string) => void
  validateCoupon: () => Promise<void>
  couponData: Coupon | null
  isCouponValidating: boolean
  submitForm: () => Promise<void>
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined)

const initialFormData: BookingFormData = {
  clientId: "",
  serviceIds: [],
  deliveryAddress: "",
  deliveryDate: undefined,
  deliveryTime: "",
  status: "PENDING",
  paymentStatus: "PENDING",
  paymentMethod: "PIX",
  couponCode: "",
  notes: "",
}

export const BookingModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>(initialFormData)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [couponData, setCouponData] = useState<Coupon | null>(null)
  const [isCouponValidating, setIsCouponValidating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [clientsRes, servicesRes] = await Promise.all([fetch("/api/clients"), fetch("/api/services")])

        if (!clientsRes.ok || !servicesRes.ok) {
          throw new Error("Failed to fetch initial data")
        }

        const clientsData = await clientsRes.json()
        const servicesData = await servicesRes.json()

        setClients(clientsData)
        setServices(servicesData)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Erro",
          description: "Falha ao carregar dados iniciais.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const openModal = useCallback((booking?: any) => {
    if (booking) {
      const deliveryDate = booking.deliveryDate ? new Date(booking.deliveryDate) : undefined
      const deliveryTime = booking.deliveryDate ? format(new Date(booking.deliveryDate), "HH:mm") : ""
      setFormData({
        id: booking.id,
        clientId: booking.clientId,
        serviceIds: booking.services.map((s: any) => s.id),
        deliveryAddress: booking.deliveryAddress,
        deliveryDate,
        deliveryTime,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        couponCode: booking.coupon?.code || "",
        notes: booking.notes || "",
      })
      setCouponData(booking.coupon || null)
    } else {
      setFormData(initialFormData)
      setCouponData(null)
    }
    setErrors({})
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setFormData(initialFormData)
    setCouponData(null)
    setErrors({})
  }, [])

  const subtotal = useMemo(() => {
    return formData.serviceIds.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId)
      return sum + (service?.price || 0)
    }, 0)
  }, [formData.serviceIds, services])

  const discountAmount = useMemo(() => {
    if (!couponData) return 0
    if (couponData.discountType === "FIXED") {
      return Math.min(couponData.discountValue, subtotal)
    }
    if (couponData.discountType === "PERCENTAGE") {
      return Math.min(subtotal * (couponData.discountValue / 100), subtotal)
    }
    return 0
  }, [couponData, subtotal])

  const totalAmount = useMemo(() => {
    return subtotal - discountAmount
  }, [subtotal, discountAmount])

  const handleServiceToggle = useCallback((serviceId: string) => {
    setFormData((prev) => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId]
      return { ...prev, serviceIds: newServiceIds }
    })
  }, [])

  const handleCouponCodeChange = useCallback((code: string) => {
    setFormData((prev) => ({ ...prev, couponCode: code }))
    setCouponData(null) // Clear coupon data when code changes
  }, [])

  const validateCoupon = useCallback(async () => {
    if (!formData.couponCode) {
      setCouponData(null)
      setErrors((prev) => ({ ...prev, couponCode: "" }))
      return
    }

    setIsCouponValidating(true)
    setErrors((prev) => ({ ...prev, couponCode: "" }))
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.couponCode, amount: subtotal }),
      })

      const data = await res.json()

      if (res.ok && data.isValid) {
        setCouponData(data.coupon)
        toast({
          title: "Sucesso",
          description: data.message,
        })
      } else {
        setCouponData(null)
        setErrors((prev) => ({ ...prev, couponCode: data.message || "Cupom inválido" }))
        toast({
          title: "Erro",
          description: data.message || "Falha ao validar cupom.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating coupon:", error)
      setCouponData(null)
      setErrors((prev) => ({ ...prev, couponCode: "Erro ao validar cupom." }))
      toast({
        title: "Erro",
        description: "Erro ao validar cupom.",
        variant: "destructive",
      })
    } finally {
      setIsCouponValidating(false)
    }
  }, [formData.couponCode, subtotal, toast])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (!formData.clientId) newErrors.clientId = "Cliente é obrigatório."
    if (formData.serviceIds.length === 0) newErrors.serviceIds = "Selecione pelo menos um serviço."
    if (!formData.deliveryAddress) newErrors.deliveryAddress = "Endereço de entrega é obrigatório."
    if (!formData.deliveryDate) newErrors.deliveryDate = "Data de entrega é obrigatória."
    if (!formData.deliveryTime) newErrors.deliveryTime = "Hora de entrega é obrigatória."
    if (!formData.paymentMethod) newErrors.paymentMethod = "Método de pagamento é obrigatório."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const fullDeliveryDate = formData.deliveryDate
        ? new Date(
            formData.deliveryDate.setHours(
              Number.parseInt(formData.deliveryTime.split(":")[0]),
              Number.parseInt(formData.deliveryTime.split(":")[1]),
              0,
              0,
            ),
          )
        : undefined

      const payload = {
        clientId: formData.clientId,
        serviceIds: formData.serviceIds,
        deliveryAddress: formData.deliveryAddress,
        deliveryDate: fullDeliveryDate?.toISOString(),
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        amount: totalAmount,
        discountAmount: discountAmount,
        couponId: couponData?.id || null,
        notes: formData.notes,
      }

      const method = formData.id ? "PUT" : "POST"
      const url = formData.id ? `/api/bookings/${formData.id}` : "/api/bookings"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Falha ao salvar agendamento.")
      }

      toast({
        title: "Sucesso",
        description: `Agendamento ${formData.id ? "atualizado" : "criado"} com sucesso!`,
      })
      closeModal()
      // Optionally, trigger a re-fetch of bookings in the parent component
    } catch (error: any) {
      console.error("Error submitting form:", error)
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar agendamento.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, totalAmount, discountAmount, couponData, toast, closeModal])

  const contextValue = useMemo(
    () => ({
      isOpen,
      openModal,
      closeModal,
      formData,
      setFormData,
      clients,
      services,
      isLoading,
      isSubmitting,
      errors,
      subtotal,
      discountAmount,
      totalAmount,
      handleServiceToggle,
      handleCouponCodeChange,
      validateCoupon,
      couponData,
      isCouponValidating,
      submitForm,
    }),
    [
      isOpen,
      openModal,
      closeModal,
      formData,
      setFormData,
      clients,
      services,
      isLoading,
      isSubmitting,
      errors,
      subtotal,
      discountAmount,
      totalAmount,
      handleServiceToggle,
      handleCouponCodeChange,
      validateCoupon,
      couponData,
      isCouponValidating,
      submitForm,
    ],
  )

  return <BookingModalContext.Provider value={contextValue}>{children}</BookingModalContext.Provider>
}

export const useBookingModal = () => {
  const context = useContext(BookingModalContext)
  if (context === undefined) {
    throw new Error("useBookingModal must be used within a BookingModalProvider")
  }
  return context
}
