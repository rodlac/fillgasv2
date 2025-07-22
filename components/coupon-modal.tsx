"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface Coupon {
  id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minimumAmount?: number | null
  usageLimit?: number | null
  usedCount: number
  expirationDate?: string | null
  isActive: boolean
}

interface CouponModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  coupon: Coupon | null
}

export function CouponModal({ isOpen, onClose, onSave, coupon }: CouponModalProps) {
  const [formData, setFormData] = useState<Omit<Coupon, "id" | "usedCount">>({
    code: "",
    discountType: "FIXED",
    discountValue: 0,
    minimumAmount: null,
    usageLimit: null,
    expirationDate: null,
    isActive: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minimumAmount: coupon.minimumAmount ? Number(coupon.minimumAmount) : null,
        usageLimit: coupon.usageLimit || null,
        expirationDate: coupon.expirationDate ? new Date(coupon.expirationDate).toISOString().split("T")[0] : null,
      })
    } else {
      setFormData({
        code: "",
        discountType: "FIXED",
        discountValue: 0,
        minimumAmount: null,
        usageLimit: null,
        expirationDate: null,
        isActive: true,
      })
    }
  }, [coupon, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "discountValue" || id === "minimumAmount" || id === "usageLimit"
          ? Number.parseFloat(value) || (value === "" ? null : 0)
          : value,
    }))
  }

  const handleSelectChange = (value: "PERCENTAGE" | "FIXED") => {
    setFormData((prev) => ({ ...prev, discountType: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        throw new Error(`Failed to ${coupon ? "update" : "create"} coupon`)
      }

      toast({
        title: "Sucesso!",
        description: `Cupom ${coupon ? "atualizado" : "criado"} com sucesso.`,
      })
      onSave()
    } catch (error) {
      console.error("Error saving coupon:", error)
      toast({
        title: "Erro",
        description: `Falha ao ${coupon ? "atualizar" : "criar"} cupom.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
              <Label htmlFor="discountType" className="text-right">
                Tipo de Desconto
              </Label>
              <Select value={formData.discountType} onValueChange={handleSelectChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixo</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentual</SelectItem>
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usageLimit" className="text-right">
                Limite de Uso
              </Label>
              <Input
                id="usageLimit"
                type="number"
                step="1"
                value={formData.usageLimit || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expirationDate" className="text-right">
                Data de Expiração
              </Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate || ""}
                onChange={handleChange}
                className="col-span-3"
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
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
