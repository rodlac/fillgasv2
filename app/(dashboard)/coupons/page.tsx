"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { CouponModal } from "@/components/coupon-modal"
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
  createdAt: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const { toast } = useToast()

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/coupons")
      const data = await response.json()
      setCoupons(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar cupons",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cupom?")) {
      try {
        await fetch(`/api/coupons/${id}`, { method: "DELETE" })
        toast({
          title: "Sucesso",
          description: "Cupom excluído com sucesso",
        })
        fetchCoupons()
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir cupom",
          variant: "destructive",
        })
      }
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedCoupon(null)
    fetchCoupons()
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupons</h1>
          <p className="text-gray-600">Gerencie cupons de desconto</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cupom
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Valor Mínimo</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `R$ ${coupon.discountValue.toFixed(2)}`}
                  </TableCell>
                  <TableCell>{coupon.minimumAmount ? `R$ ${coupon.minimumAmount.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>
                    {coupon.currentUsage}/{coupon.maxUsage || "∞"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(coupon.validFrom).toLocaleDateString()}</div>
                      <div>{new Date(coupon.validUntil).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(coupon.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CouponModal open={showModal} onClose={handleModalClose} coupon={selectedCoupon} />
    </div>
  )
}
