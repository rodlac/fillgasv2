"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search } from "lucide-react"
import { CouponModal } from "@/components/coupon-modal"

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

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons")
      if (!res.ok) {
        throw new Error("Failed to fetch coupons")
      }
      const data = await res.json()
      setCoupons(data || []) // Ensure it's an array
    } catch (error) {
      console.error("Error fetching coupons:", error)
      setCoupons([]) // Set to empty array on error
    }
  }

  const filteredCoupons = coupons.filter((coupon) => coupon.code.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setIsModalOpen(true)
  }

  const handleNewCoupon = () => {
    setSelectedCoupon(null)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    await fetchCoupons()
    setIsModalOpen(false)
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${Number(coupon.discountValue).toFixed(0)}%`
    }
    return `R$ ${Number(coupon.discountValue).toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cupons</h1>
        <Button onClick={handleNewCoupon}>
          <PlusCircle className="mr-2 h-5 w-5" /> Novo Cupom
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por código do cupom..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Uso Limite</TableHead>
                  <TableHead>Usado</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>{coupon.discountType}</TableCell>
                    <TableCell>{formatDiscount(coupon)}</TableCell>
                    <TableCell>
                      {coupon.minimumAmount ? `R$ ${Number(coupon.minimumAmount).toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>{coupon.usageLimit ? coupon.usageLimit : "Ilimitado"}</TableCell>
                    <TableCell>{coupon.usedCount}</TableCell>
                    <TableCell>
                      {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.isActive ? "default" : "destructive"}>
                        {coupon.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        coupon={selectedCoupon}
      />
    </div>
  )
}
