"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PedidoForm from "@/components/pedido-form"
import { Badge } from "@/components/ui/badge"
import type { Pedido } from "@/types/pedido"

interface PedidoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pedidoInicial: Pedido | null
  onSubmit: (pedido: Pedido) => void
}

export default function PedidoDialog({ open, onOpenChange, pedidoInicial, onSubmit }: PedidoDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "producao":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Em Produção
          </Badge>
        )
      case "pronto":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Pronto
          </Badge>
        )
      case "enviado":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Enviado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{pedidoInicial ? `Editar Pedido de ${pedidoInicial.nome}` : "Novo Pedido"}</DialogTitle>
            {pedidoInicial && getStatusBadge(pedidoInicial.status)}
          </div>
        </DialogHeader>
        <PedidoForm onSubmit={onSubmit} onCancel={() => onOpenChange(false)} pedidoInicial={pedidoInicial} />
      </DialogContent>
    </Dialog>
  )
}

