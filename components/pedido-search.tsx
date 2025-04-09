"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PedidoSearchProps {
  onSearch: (term: string) => void
}

export default function PedidoSearch({ onSearch }: PedidoSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por nome, email ou telefone..."
        className="pl-8"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
} 