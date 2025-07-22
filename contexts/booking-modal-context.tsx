"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"

// Tipos de dados
interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Coupon {
  id: string
  code: string
  name: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minimumAmount: number | null
  usageLimit: number | null
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface BookingFormData {
  id?: string
  clientId: string
  deliveryAddress: string
  deliveryDate: Date
  deliveryTime: string
  serviceIds: string[]
  couponCode: string
  notes: string
  status: string
  paymentMethod: string
  paymentStatus: string
}

interface BookingModalContextType {
  isOpen: boolean
  openModal: (booking?: any) => void
  closeModal: () => void
  formData: BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>
  clients: Client[]
  services: Service[]
  loading: boolean
  submitting: boolean
  discountAmount: number
  totalAmount: number
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: keyof BookingFormData) => (value: string) => void
  handleServiceChange: (serviceId: string) => void
  handleDateChange: (date: Date | undefined) => void
  handleTimeChange: (time: string) => void
  handleCouponCodeChange: (code: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  validateCoupon: () => Promise<void>
  couponError: string | null
  isEditMode: boolean
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined)

const initialFormData: BookingFormData = {
  clientId: "",
  deliveryAddress: "",
  deliveryDate: new Date(),
  deliveryTime: "09:00",
  serviceIds: [],
  couponCode: "",
  notes: "",
  status: "scheduled",
  paymentMethod: "pix",
  paymentStatus: "pending",
}

export const BookingModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>(initialFormData)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const { toast } = useToast()

  const fetchClientsAndServices = useCallback(async () => {
    setLoading(true)
    try {
      const [clientsRes, servicesRes] = await Promise.all([fetch("/api/clients"), fetch("/api/services")])

      if (!clientsRes.ok || !servicesRes.ok) {
        throw new Error("Failed to fetch clients or services")
      }

      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()

      setClients(clientsData)
      setServices(servicesData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar clientes e serviços.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchClientsAndServices()
  }, [fetchClientsAndServices])

  const openModal = useCallback((booking?: any) => {
    if (booking) {
      setIsEditMode(true)
      setFormData({
        id: booking.id,
        clientId: booking.clientId,
        deliveryAddress: booking.deliveryAddress,
        deliveryDate: new Date(booking.deliveryDate),
        deliveryTime: new Date(booking.deliveryDate).toTimeString().slice(0, 5),
        serviceIds: booking.services.map((s: any) => s.id),
        couponCode: booking.coupon?.code || "",
        notes: booking.notes || "",
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
      })
      setDiscountAmount(Number(booking.discountAmount) || 0)
    } else {
      setIsEditMode(false)
      setFormData(initialFormData)
      setDiscountAmount(0)
      setCouponError(null)
    }
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setFormData(initialFormData)
    setDiscountAmount(0)
    setCouponError(null)
    setIsEditMode(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSelectChange = useCallback(
    (name: keyof BookingFormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  const handleServiceChange = useCallback((serviceId: string) => {
    setFormData((prev) => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId]
      return { ...prev, serviceIds: newServiceIds }
    })
  }, [])

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, deliveryDate: date }))
    }
  }, [])

  const handleTimeChange = useCallback((time: string) => {
    setFormData((prev) => ({ ...prev, deliveryTime: time }))
  }, [])

  const handleCouponCodeChange = useCallback((code: string) => {
    setFormData((prev) => ({ ...prev, couponCode: code }))
    setCouponError(null)
    setDiscountAmount(0)
  }, [])

  const subtotalAmount = useMemo(() => {
    return formData.serviceIds.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId)
      return sum + (service ? Number(service.price) : 0)
    }, 0)
  }, [formData.serviceIds, services])

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotalAmount - discountAmount)
  }, [subtotalAmount, discountAmount])

  const validateCoupon = useCallback(async () => {
    if (!formData.couponCode) {
      setCouponError(null)
      setDiscountAmount(0)
      return
    }

    if (!formData.clientId) {
      setCouponError("Selecione um cliente para validar o cupom.")
      setDiscountAmount(0)
      return
    }

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.couponCode,
          clientId: formData.clientId,
          orderAmount: subtotalAmount,
        }),
      })
      const data = await res.json()

      if (data.isValid) {
        setDiscountAmount(data.discountAmount)
        setCouponError(null)
        toast({
          title: "Sucesso",
          description: `Cupom "${formData.couponCode}" aplicado! Desconto: R$ ${data.discountAmount.toFixed(2)}`,
        })
      } else {
        setDiscountAmount(0)
        setCouponError(data.reason || "Erro ao validar cupom.")
        toast({
          title: "Erro no Cupom",
          description: data.reason || "Não foi possível aplicar o cupom.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating coupon:", error)
      setDiscountAmount(0)
      setCouponError("Erro ao validar cupom. Tente novamente.")
      toast({
        title: "Erro",
        description: "Falha na comunicação com o servidor de cupons.",
        variant: "destructive",
      })
    }
  }, [formData.couponCode, formData.clientId, subtotalAmount, toast])

  useEffect(() => {
    const handler = setTimeout(() => {
      validateCoupon()
    }, 500) // Debounce coupon validation
    return () => clearTimeout(handler)
  }, [formData.couponCode, formData.clientId, subtotalAmount, validateCoupon])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)
      setCouponError(null) // Clear coupon error on submit attempt

      // Basic validation
      if (!formData.clientId || !formData.deliveryAddress || formData.serviceIds.length === 0) {
        toast({
          title: "Erro de Validação",
          description: "Por favor, preencha todos os campos obrigatórios (Cliente, Endereço, Serviços).",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      const deliveryDateTime = new Date(formData.deliveryDate)
      const [hours, minutes] = formData.deliveryTime.split(":").map(Number)
      deliveryDateTime.setHours(hours, minutes, 0, 0)

      const payload = {
        clientId: formData.clientId,
        deliveryAddress: formData.deliveryAddress,
        deliveryDate: deliveryDateTime.toISOString(),
        serviceIds: formData.serviceIds,
        couponId: formData.couponCode
          ? await fetch("/api/coupons/validate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: formData.couponCode,
                clientId: formData.clientId,
                orderAmount: subtotalAmount,
              }),
            })
              .then((res) => res.json())
              .then((data) => data.coupon?.id)
          : null,
        notes: formData.notes,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        amount: subtotalAmount,
        discountAmount: discountAmount,
      }

      try {
        const method = isEditMode ? "PUT" : "POST"
        const url = isEditMode ? `/api/bookings/${formData.id}` : "/api/bookings"
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
          description: `Agendamento ${isEditMode ? "atualizado" : "criado"} com sucesso!`,
        })
        closeModal()
        // Optionally, refresh bookings list in parent component
      } catch (error: any) {
        console.error("Error saving booking:", error)
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro ao salvar o agendamento.",
          variant: "destructive",
        })
      } finally {
        setSubmitting(false)
      }
    },
    [formData, subtotalAmount, discountAmount, isEditMode, closeModal, toast],
  )

  const contextValue = useMemo(
    () => ({
      isOpen,
      openModal,
      closeModal,
      formData,
      setFormData,
      clients,
      services,
      loading,
      submitting,
      discountAmount,
      totalAmount,
      handleInputChange,
      handleSelectChange,
      handleServiceChange,
      handleDateChange,
      handleTimeChange,
      handleCouponCodeChange,
      handleSubmit,
      validateCoupon,
      couponError,
      isEditMode,
    }),
    [
      isOpen,
      openModal,
      closeModal,
      formData,
      clients,
      services,
      loading,
      submitting,
      discountAmount,
      totalAmount,
      handleInputChange,
      handleSelectChange,
      handleServiceChange,
      handleDateChange,
      handleTimeChange,
      handleCouponCodeChange,
      handleSubmit,
      validateCoupon,
      couponError,
      isEditMode,
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
