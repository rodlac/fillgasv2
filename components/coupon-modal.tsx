"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface Coupon {
  id: string
  code: string
  discountType: string
  discountValue: number
  minimumAmount?: number
  maxUsage?: number
  currentUsage: number
  validFrom: string
  validUntil: string
  isActive: boolean
}

interface CouponModalProps {
  open: boolean
  onClose: () => void
  coupon: Coupon | null
}

export function CouponModal({ open, onClose, coupon }: CouponModalProps) {
  const [formData, setFormData] = useState<Partial<Coupon>>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        validFrom: coupon.validFrom.split("T")[0], // Format date for input type="date"
        validUntil: coupon.validUntil.split("T")[0], // Format date for input type="date"
      })
    } else {
      setFormData({
        discountType: "percentage",
        discountValue: 0,
        minimumAmount: 0,
        maxUsage: 0,
        isActive: true,
        validFrom: new Date().toISOString().split("T")[0],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
      })
    }
  }, [coupon])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "discountValue" || id === "minimumAmount"
          ? Number.parseFloat(value) || 0
          : id === "maxUsage"
            ? Number.parseInt(value) || 0
            : value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, discountType: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const method = coupon ? "PUT" : "POST"
      const url = coupon ? `/api/coupons/${coupon.id}` : "/api/coupons"
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao salvar cupom")
      }

      toast({
        title: "Sucesso",
        description: `Cupom ${coupon ? "atualizado" : "criado"} com sucesso!`,
      })
      onClose()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{coupon ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Código
            </Label>
            <Input id="code" value={formData.code || ""} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountType" className="text-right">
              Tipo Desconto
            </Label>
            <Select value={formData.discountType} onValueChange={handleSelectChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentual</SelectItem>
                <SelectItem value="fixed">Fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountValue" className="text-right">
              Valor Desconto
            </Label>
            <Input
              id="discountValue"
              type="number"
              step="0.01"
              value={formData.discountValue !== undefined ? formData.discountValue : ""}
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
              value={formData.minimumAmount !== undefined ? formData.minimumAmount : ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxUsage" className="text-right">
              Uso Máximo
            </Label>
            <Input
              id="maxUsage"
              type="number"
              value={formData.maxUsage !== undefined ? formData.maxUsage : ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="validFrom" className="text-right">
              Válido De
            </Label>
            <Input
              id="validFrom"
              type="date"
              value={formData.validFrom || ""}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="validUntil" className="text-right">
              Válido Até
            </Label>
            <Input
              id="validUntil"
              type="date"
              value={formData.validUntil || ""}
              onChange={handleChange}
              className="col-span-3"
              required
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
