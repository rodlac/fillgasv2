"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  client: Client | null
}

export function ClientModal({ isOpen, onClose, onSave, client }: ClientModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (client) {
      setName(client.name)
      setEmail(client.email)
      setPhone(client.phone)
      setAddress(client.address)
    } else {
      setName("")
      setEmail("")
      setPhone("")
      setAddress("")
    }
  }, [client, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const clientData = { name, email, phone, address }

    try {
      if (client) {
        // Update existing client
        const { error } = await supabase.from("clients").update(clientData).eq("id", client.id)

        if (error) throw error
        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram salvas com sucesso.",
        })
      } else {
        // Add new client
        const { error } = await supabase.from("clients").insert(clientData)

        if (error) throw error
        toast({
          title: "Cliente adicionado",
          description: "Novo cliente cadastrado com sucesso.",
        })
      }
      onSave()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar cliente",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Adicionar Cliente"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Faça alterações nas informações do cliente."
              : "Preencha os dados para adicionar um novo cliente."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Endereço
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="col-span-3"
                required
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
