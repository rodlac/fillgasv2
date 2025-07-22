"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface BookingFormData {
  clientId: string
  serviceId: string
  scheduledDate: string
  scheduledTime: string
  address: string
  notes: string
  couponCode: string
}

interface BookingModalContextType {
  isOpen: boolean
  formData: BookingFormData
  isEditing: boolean
  openModal: (booking?: any) => void
  closeModal: () => void
  updateFormData: (data: Partial<BookingFormData>) => void
  resetFormData: () => void
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined)

const initialFormData: BookingFormData = {
  clientId: "",
  serviceId: "",
  scheduledDate: "",
  scheduledTime: "",
  address: "",
  notes: "",
  couponCode: "",
}

export function BookingModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>(initialFormData)
  const [isEditing, setIsEditing] = useState(false)

  const openModal = useCallback((booking?: any) => {
    if (booking) {
      setIsEditing(true)
      setFormData({
        clientId: booking.clientId || "",
        serviceId: booking.serviceId || "",
        scheduledDate: booking.scheduledDate ? new Date(booking.scheduledDate).toISOString().split("T")[0] : "",
        scheduledTime: booking.scheduledTime || "",
        address: booking.address || "",
        notes: booking.notes || "",
        couponCode: booking.couponCode || "",
      })
    } else {
      setIsEditing(false)
      setFormData(initialFormData)
    }
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setIsEditing(false)
    setFormData(initialFormData)
  }, [])

  const updateFormData = useCallback((data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }, [])

  const resetFormData = useCallback(() => {
    setFormData(initialFormData)
  }, [])

  return (
    <BookingModalContext.Provider
      value={{
        isOpen,
        formData,
        isEditing,
        openModal,
        closeModal,
        updateFormData,
        resetFormData,
      }}
    >
      {children}
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  const context = useContext(BookingModalContext)
  if (context === undefined) {
    throw new Error("useBookingModal must be used within a BookingModalProvider")
  }
  return context
}
