"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

interface Coupon {
  id?: string
  code: string
  name: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minimumAmount: number | null
  validFrom: string
  validUntil: string
  maxUsage: number | null
  maxUsagePerUser: number | null
  isActive: boolean
}

interface CouponModalProps {
  isOpen: boolean
  onClose: () => void
  coupon: Coupon | null
}

export function CouponModal({ isOpen, onClose, coupon }: CouponModalProps) {
  const [formData, setFormData] = useState<Coupon>({
    code: "",
    name: "",
    discountType: "fixed",
    discountValue: 0,
    minimumAmount: null,
    validFrom: new Date().toISOString(),
    validUntil: new Date().toISOString(),
    maxUsage: null,
    maxUsagePerUser: null,
    isActive: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minimumAmount: coupon.minimumAmount ? Number(coupon.minimumAmount) : null,
        validFrom: new Date(coupon.validFrom).toISOString(),
        validUntil: new Date(coupon.validUntil).toISOString(),
      })
    } else {
      setFormData({
        code: "",
        name: "",
        discountType: "fixed",
        discountValue: 0,
        minimumAmount: null,
        validFrom: new Date().toISOString(),
        validUntil: new Date().toISOString(),
        maxUsage: null,
        maxUsagePerUser: null,
        isActive: true,
      })
    }
  }, [coupon])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: ["discountValue", "minimumAmount", "maxUsage", "maxUsagePerUser"].includes(id)
        ? Number.parseFloat(value) ||
          (id === "minimumAmount" || id === "maxUsage" || id === "maxUsagePerUser" ? null : 0)
        : value,
    }))
  }

  const handleSelectChange = (value: "percentage" | "fixed") => {
    setFormData((prev) => ({
      ...prev,
      discountType: value,
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }))
  }

  const handleDateChange = (date: Date | undefined, field: "validFrom" | "validUntil") => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        [field]: date.toISOString(),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const method = coupon ? "PUT" : "POST"
      const url = coupon ? `/api/coupons/${coupon.id}` : "/api/coupons"
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
      }

      toast({
        title: "Sucesso",
        description: `Cupom ${coupon ? "atualizado" : "criado"} com sucesso.`,
      })
      onClose()
    } catch (error: any) {
      console.error("Failed to save coupon:", error)
      toast({
        title: "Erro",
        description: `Falha ao ${coupon ? "atualizar" : "criar"} cupom: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{coupon ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Código
              </Label>
              <Input id="code" value={formData.code} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discountType" className="text-right">
                Tipo de Desconto
              </Label>
              <Select value={formData.discountType} onValueChange={handleSelectChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Valor Fixo</SelectItem>
                  <SelectItem value="percentage">Percentual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discountValue" className="text-right">
                Valor do Desconto
              </Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                value={formData.discountValue}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minimumAmount" className="text-right">
                Valor Mínimo
              </Label>
              <Input
                id="minimumAmount"
                type="number"
                step="0.01"
                value={formData.minimumAmount || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Opcional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="validFrom" className="text-right">
                Válido De
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="col-span-3 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.validFrom ? format(new Date(formData.validFrom), "PPP") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.validFrom)}
                    onSelect={(date) => handleDateChange(date, "validFrom")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="validUntil" className="text-right">
                Válido Até
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="col-span-3 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.validUntil ? (
                      format(new Date(formData.validUntil), "PPP")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.validUntil)}
                    onSelect={(date) => handleDateChange(date, "validUntil")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxUsage" className="text-right">
                Uso Máximo
              </Label>
              <Input
                id="maxUsage"
                type="number"
                step="1"
                value={formData.maxUsage || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Opcional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxUsagePerUser" className="text-right">
                Uso Máximo por Cliente
              </Label>
              <Input
                id="maxUsagePerUser"
                type="number"
                step="1"
                value={formData.maxUsagePerUser || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Opcional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Ativo
              </Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
