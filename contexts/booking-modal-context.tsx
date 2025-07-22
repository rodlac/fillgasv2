"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface Client {
  id: string
  name: string
  email: string
  phone: string
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
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
}

interface BookingModalState {
  // Modal state
  isOpen: boolean
  isLoading: boolean

  // Form data
  clientId: string
  serviceIds: string[]
  scheduledDate: string
  scheduledTime: string
  notes: string
  paymentMethod: string
  status: string
  couponCode: string

  // Calculated values
  subtotal: number
  discountAmount: number
  finalAmount: number

  // Data lists
  clients: Client[]
  services: Service[]
  coupons: Coupon[]

  // Validation
  errors: Record<string, string>
}

interface BookingModalActions {
  // Modal actions
  openModal: () => void
  closeModal: () => void

  // Form actions
  setClientId: (clientId: string) => void
  setServiceIds: (serviceIds: string[]) => void
  setScheduledDate: (date: string) => void
  setScheduledTime: (time: string) => void
  setNotes: (notes: string) => void
  setPaymentMethod: (method: string) => void
  setStatus: (status: string) => void
  setCouponCode: (code: string) => void

  // Data actions
  loadClients: () => Promise<void>
  loadServices: () => Promise<void>
  validateCoupon: () => Promise<void>

  // Form actions
  resetForm: () => void
  submitBooking: () => Promise<void>

  // Calculations
  calculateTotals: () => void
}

type BookingModalContextType = BookingModalState & BookingModalActions

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined)

const initialState: BookingModalState = {
  isOpen: false,
  isLoading: false,
  clientId: "",
  serviceIds: [],
  scheduledDate: "",
  scheduledTime: "",
  notes: "",
  paymentMethod: "",
  status: "PENDING",
  couponCode: "",
  subtotal: 0,
  discountAmount: 0,
  finalAmount: 0,
  clients: [],
  services: [],
  coupons: [],
  errors: {},
}

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingModalState>(initialState)

  const updateState = useCallback((updates: Partial<BookingModalState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const openModal = useCallback(() => {
    console.log("Opening booking modal")
    updateState({ isOpen: true })
  }, [updateState])

  const closeModal = useCallback(() => {
    console.log("Closing booking modal")
    updateState({ isOpen: false })
    resetForm()
  }, [updateState])

  const resetForm = useCallback(() => {
    console.log("Resetting booking form")
    updateState({
      clientId: "",
      serviceIds: [],
      scheduledDate: "",
      scheduledTime: "",
      notes: "",
      paymentMethod: "",
      status: "PENDING",
      couponCode: "",
      subtotal: 0,
      discountAmount: 0,
      finalAmount: 0,
      errors: {},
    })
  }, [updateState])

  const setClientId = useCallback(
    (clientId: string) => {
      console.log("Setting clientId to:", clientId)
      updateState({ clientId, errors: { ...state.errors, clientId: "" } })
    },
    [updateState, state.errors],
  )

  const setServiceIds = useCallback(
    (serviceIds: string[]) => {
      console.log("Setting serviceIds to:", serviceIds)
      updateState({ serviceIds, errors: { ...state.errors, serviceIds: "" } })
      // Recalculate totals when services change
      setTimeout(() => calculateTotals(), 0)
    },
    [updateState, state.errors],
  )

  const setScheduledDate = useCallback(
    (scheduledDate: string) => {
      console.log("Setting scheduledDate to:", scheduledDate)
      updateState({ scheduledDate, errors: { ...state.errors, scheduledDate: "" } })
    },
    [updateState, state.errors],
  )

  const setScheduledTime = useCallback(
    (scheduledTime: string) => {
      console.log("Setting scheduledTime to:", scheduledTime)
      updateState({ scheduledTime, errors: { ...state.errors, scheduledTime: "" } })
    },
    [updateState, state.errors],
  )

  const setNotes = useCallback(
    (notes: string) => {
      updateState({ notes })
    },
    [updateState],
  )

  const setPaymentMethod = useCallback(
    (paymentMethod: string) => {
      console.log("Setting paymentMethod to:", paymentMethod)
      updateState({ paymentMethod, errors: { ...state.errors, paymentMethod: "" } })
    },
    [updateState, state.errors],
  )

  const setStatus = useCallback(
    (status: string) => {
      console.log("Setting status to:", status)
      updateState({ status })
    },
    [updateState],
  )

  const setCouponCode = useCallback(
    (couponCode: string) => {
      console.log("Setting couponCode to:", couponCode)
      updateState({ couponCode, errors: { ...state.errors, couponCode: "" } })
    },
    [updateState, state.errors],
  )

  const loadClients = useCallback(async () => {
    try {
      updateState({ isLoading: true })
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        updateState({ clients: data.clients || [] })
      }
    } catch (error) {
      console.error("Error loading clients:", error)
    } finally {
      updateState({ isLoading: false })
    }
  }, [updateState])

  const loadServices = useCallback(async () => {
    try {
      updateState({ isLoading: true })
      const response = await fetch("/api/services")
      if (response.ok) {
        const data = await response.json()
        updateState({ services: data || [] })
      }
    } catch (error) {
      console.error("Error loading services:", error)
    } finally {
      updateState({ isLoading: false })
    }
  }, [updateState])

  const validateCoupon = useCallback(async () => {
    if (!state.couponCode.trim()) {
      updateState({ discountAmount: 0 })
      calculateTotals()
      return
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: state.couponCode }),
      })

      if (response.ok) {
        const coupon = await response.json()
        let discount = 0

        if (coupon.discountType === "PERCENTAGE") {
          discount = (state.subtotal * coupon.discountValue) / 100
        } else {
          discount = coupon.discountValue
        }

        updateState({
          discountAmount: discount,
          errors: { ...state.errors, couponCode: "" },
        })
      } else {
        updateState({
          discountAmount: 0,
          errors: { ...state.errors, couponCode: "Cupom inválido ou expirado" },
        })
      }
    } catch (error) {
      console.error("Error validating coupon:", error)
      updateState({
        discountAmount: 0,
        errors: { ...state.errors, couponCode: "Erro ao validar cupom" },
      })
    }

    calculateTotals()
  }, [state.couponCode, state.subtotal, state.errors, updateState])

  const calculateTotals = useCallback(() => {
    const selectedServices = state.services.filter((service) => state.serviceIds.includes(service.id))

    const subtotal = selectedServices.reduce((sum, service) => sum + service.price, 0)
    const finalAmount = Math.max(0, subtotal - state.discountAmount)

    console.log("Calculating totals:", { subtotal, discountAmount: state.discountAmount, finalAmount })

    updateState({ subtotal, finalAmount })
  }, [state.services, state.serviceIds, state.discountAmount, updateState])

  const submitBooking = useCallback(async () => {
    // Validate form
    const errors: Record<string, string> = {}

    if (!state.clientId) errors.clientId = "Cliente é obrigatório"
    if (state.serviceIds.length === 0) errors.serviceIds = "Pelo menos um serviço é obrigatório"
    if (!state.scheduledDate) errors.scheduledDate = "Data é obrigatória"
    if (!state.scheduledTime) errors.scheduledTime = "Horário é obrigatório"
    if (!state.paymentMethod) errors.paymentMethod = "Método de pagamento é obrigatório"

    if (Object.keys(errors).length > 0) {
      updateState({ errors })
      return
    }

    try {
      updateState({ isLoading: true })

      const bookingData = {
        clientId: state.clientId,
        serviceIds: state.serviceIds,
        scheduledDate: state.scheduledDate,
        scheduledTime: state.scheduledTime,
        notes: state.notes,
        amount: state.subtotal,
        discountAmount: state.discountAmount,
        finalAmount: state.finalAmount,
        couponCode: state.couponCode || null,
        status: state.status,
        paymentMethod: state.paymentMethod,
      }

      console.log("Submitting booking:", bookingData)

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        console.log("Booking created successfully")
        closeModal()
        // Refresh the page or emit an event to refresh the bookings list
        window.location.reload()
      } else {
        const errorData = await response.json()
        console.error("Error creating booking:", errorData)
        updateState({
          errors: { submit: errorData.error || "Erro ao criar agendamento" },
        })
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      updateState({
        errors: { submit: "Erro ao criar agendamento" },
      })
    } finally {
      updateState({ isLoading: false })
    }
  }, [state, updateState, closeModal])

  const contextValue: BookingModalContextType = {
    ...state,
    openModal,
    closeModal,
    setClientId,
    setServiceIds,
    setScheduledDate,
    setScheduledTime,
    setNotes,
    setPaymentMethod,
    setStatus,
    setCouponCode,
    loadClients,
    loadServices,
    validateCoupon,
    resetForm,
    submitBooking,
    calculateTotals,
  }

  return <BookingModalContext.Provider value={contextValue}>{children}</BookingModalContext.Provider>
}

export function useBookingModal() {
  const context = useContext(BookingModalContext)
  if (context === undefined) {
    throw new Error("useBookingModal must be used within a BookingModalProvider")
  }
  return context
}
