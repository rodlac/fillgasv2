"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  cpfCnpj: string
  address: string
}

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  client: Client | null
}

export function ClientModal({ isOpen, onClose, onSave, client }: ClientModalProps) {
  const [formData, setFormData] = useState<Omit<Client, "id">>({
    name: "",
    email: "",
    phone: "",
    cpfCnpj: "",
    address: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (client) {
      setFormData(client)
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        cpfCnpj: "",
        address: "",
      })
    }
  }, [client, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = client ? "PUT" : "POST"
      const url = client ? `/api/clients/${client.id}` : "/api/clients"
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error(`Failed to ${client ? "update" : "create"} client`)
      }

      toast({
        title: "Sucesso!",
        description: `Cliente ${client ? "atualizado" : "criado"} com sucesso.`,
      })
      onSave()
    } catch (error) {
      console.error("Error saving client:", error)
      toast({
        title: "Erro",
        description: `Falha ao ${client ? "atualizar" : "criar"} cliente.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefone
              </Label>
              <Input id="phone" value={formData.phone} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpfCnpj" className="text-right">
                CPF/CNPJ
              </Label>
              <Input id="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Endereço
              </Label>
              <Input id="address" value={formData.address} onChange={handleChange} className="col-span-3" required />
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
