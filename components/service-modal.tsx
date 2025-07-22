"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface Service {
  id: string
  name: string
  description: string
  price: number
}

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  service: Service | null
}

export function ServiceModal({ isOpen, onClose, onSave, service }: ServiceModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (service) {
      setName(service.name)
      setDescription(service.description)
      setPrice(service.price)
    } else {
      setName("")
      setDescription("")
      setPrice(0)
    }
  }, [service, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const serviceData = { name, description, price }

    try {
      if (service) {
        // Update existing service
        const { error } = await supabase.from("services").update(serviceData).eq("id", service.id)

        if (error) throw error
        toast({
          title: "Serviço atualizado",
          description: "As informações do serviço foram salvas com sucesso.",
        })
      } else {
        // Add new service
        const { error } = await supabase.from("services").insert(serviceData)

        if (error) throw error
        toast({
          title: "Serviço adicionado",
          description: "Novo serviço cadastrado com sucesso.",
        })
      }
      onSave()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar serviço",
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
          <DialogTitle>{service ? "Editar Serviço" : "Adicionar Serviço"}</DialogTitle>
          <DialogDescription>
            {service
              ? "Faça alterações nas informações do serviço."
              : "Preencha os dados para adicionar um novo serviço."}
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
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Preço
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number.parseFloat(e.target.value))}
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
