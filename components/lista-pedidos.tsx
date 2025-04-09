"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import PedidoCard from "./pedido-card"
import type { Pedido } from "@/types/pedido"

interface ListaPedidosProps {
  pedidos: Pedido[]
  onEdit: (pedido: Pedido) => void
  onDelete: (id: string) => void
}

export default function ListaPedidos({ pedidos, onEdit, onDelete }: ListaPedidosProps) {
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<string | null>(null)

  const confirmarExclusao = (id: string) => {
    setPedidoParaExcluir(id)
  }

  const cancelarExclusao = () => {
    setPedidoParaExcluir(null)
  }

  const executarExclusao = () => {
    if (pedidoParaExcluir) {
      onDelete(pedidoParaExcluir)
      setPedidoParaExcluir(null)
    }
  }

  return (
    <div className="space-y-4">
      {pedidos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum pedido encontrado nesta categoria.</p>
        </div>
      ) : (
        pedidos.map((pedido) => (
          <PedidoCard key={pedido.id} pedido={pedido} onEdit={onEdit} onDelete={confirmarExclusao} />
        ))
      )}

      <AlertDialog open={!!pedidoParaExcluir} onOpenChange={cancelarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executarExclusao} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

