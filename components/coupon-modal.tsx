"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface CouponModalProps {
  open: boolean
  onClose: () => void
  coupon?: any
}

export function CouponModal({ open, onClose, coupon }: CouponModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minimumAmount: 0,
    maxUsage: 0,
    validFrom: "",
    validUntil: "",
    isActive: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      if (coupon) {
        setFormData({
          code: coupon.code || "",
          discountType: coupon.discountType || "percentage",
          discountValue: coupon.discountValue || 0,
          minimumAmount: coupon.minimumAmount || 0,
          maxUsage: coupon.maxUsage || 0,
          validFrom: coupon.validFrom?.split("T")[0] || "",
          validUntil: coupon.validUntil?.split("T")[0] || "",
          isActive: coupon.isActive ?? true,
        })
      } else {
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: 0,
          minimumAmount: 0,
          maxUsage: 0,
          validFrom: "",
          validUntil: "",
          isActive: true,
        })
      }
    }
  }, [open, coupon])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = coupon ? `/api/coupons/${coupon.id}` : "/api/coupons"
      const method = coupon ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Cupom ${coupon ? "atualizado" : "criado"} com sucesso`,
        })
        onClose()
      } else {
        throw new Error("Erro ao salvar cupom")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar cupom",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{coupon ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Tipo de Desconto</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, discountType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual</SelectItem>
                  <SelectItem value="fixed">Valor Fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">Valor {formData.discountType === "percentage" ? "(%)" : "(R$)"}</Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: Number.parseFloat(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumAmount">Valor Mínimo (R$)</Label>
              <Input
                id="minimumAmount"
                type="number"
                step="0.01"
                value={formData.minimumAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, minimumAmount: Number.parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUsage">Limite de Uso</Label>
              <Input
                id="maxUsage"
                type="number"
                value={formData.maxUsage}
                onChange={(e) => setFormData((prev) => ({ ...prev, maxUsage: Number.parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Válido de</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData((prev) => ({ ...prev, validFrom: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Válido até</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData((prev) => ({ ...prev, validUntil: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Ativo</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
