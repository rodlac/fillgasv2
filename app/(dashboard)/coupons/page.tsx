"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CouponModal } from "@/components/coupon-modal"
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Coupon {
  id: string
  code: string
  name: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minimumAmount: number | null
  validFrom: string
  validUntil: string
  maxUsage: number | null
  currentUsage: number
  maxUsagePerUser: number | null
  isActive: boolean
  createdAt: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/coupons")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setCoupons(data || []) // Ensure it's an array
    } catch (error) {
      console.error("Failed to fetch coupons:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar cupons.",
        variant: "destructive",
      })
      setCoupons([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleNewCoupon = () => {
    setEditingCoupon(null)
    setIsModalOpen(true)
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setIsModalOpen(true)
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este cupom?")) {
      return
    }
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      toast({
        title: "Sucesso",
        description: "Cupom excluído com sucesso.",
      })
      fetchCoupons()
    } catch (error) {
      console.error("Failed to delete coupon:", error)
      toast({
        title: "Erro",
        description: "Falha ao excluir cupom.",
        variant: "destructive",
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCoupon(null)
    fetchCoupons() // Refresh coupons after modal close
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Carregando cupons...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Cupons</h1>
        <Button onClick={handleNewCoupon}>
          <PlusIcon className="mr-2 h-4 w-4" /> Novo Cupom
        </Button>
      </div>

      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por código ou nome..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Uso</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupons.length > 0 ? (
              filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.name}</TableCell>
                  <TableCell>{coupon.discountType === "percentage" ? "Percentual" : "Fixo"}</TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage"
                      ? `${Number(coupon.discountValue).toFixed(0)}%`
                      : `R$ ${Number(coupon.discountValue).toFixed(2)}`}
                  </TableCell>
                  <TableCell>{coupon.minimumAmount ? `R$ ${Number(coupon.minimumAmount).toFixed(2)}` : "-"}</TableCell>
                  <TableCell>
                    {format(new Date(coupon.validFrom), "dd/MM/yyyy")} -{" "}
                    {format(new Date(coupon.validUntil), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {coupon.currentUsage} / {coupon.maxUsage || "∞"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {coupon.isActive ? "Sim" : "Não"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCoupon(coupon)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(coupon.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Nenhum cupom encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && <CouponModal isOpen={isModalOpen} onClose={handleModalClose} coupon={editingCoupon} />}
    </div>
  )
}
