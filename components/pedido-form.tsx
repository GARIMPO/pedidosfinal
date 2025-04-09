"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { Pedido } from "@/types/pedido"

interface PedidoFormProps {
  onSubmit: (pedido: Pedido) => void
  onCancel: () => void
  pedidoInicial?: Pedido | null
}

export default function PedidoForm({ onSubmit, onCancel, pedidoInicial }: PedidoFormProps) {
  const [nome, setNome] = useState(pedidoInicial?.nome || "")
  const [telefone, setTelefone] = useState(pedidoInicial?.telefone || "")
  const [email, setEmail] = useState(pedidoInicial?.email || "")
  const [status, setStatus] = useState(pedidoInicial?.status || "producao")
  const [endereco, setEndereco] = useState(pedidoInicial?.endereco || "")
  const [dataPedido, setDataPedido] = useState<Date | undefined>(
    pedidoInicial?.dataPedido ? new Date(pedidoInicial.dataPedido) : new Date(),
  )
  const [codigoRastreamento, setCodigoRastreamento] = useState(pedidoInicial?.codigoRastreamento || "")
  const [descricoes, setDescricoes] = useState<string[]>(pedidoInicial?.descricoes || [""])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Filtra descrições vazias
    const descricoesValidas = descricoes.filter((desc) => desc.trim() !== "")

    const pedido: Pedido = {
      id: pedidoInicial?.id || uuidv4(),
      nome,
      telefone,
      email,
      status,
      endereco,
      dataPedido: dataPedido?.toISOString() || new Date().toISOString(),
      codigoRastreamento,
      descricoes: descricoesValidas.length > 0 ? descricoesValidas : [""],
      dataCriacao: pedidoInicial?.dataCriacao || new Date().toISOString(),
    }

    onSubmit(pedido)
  }

  const adicionarDescricao = () => {
    setDescricoes([...descricoes, ""])
  }

  const atualizarDescricao = (index: number, valor: string) => {
    const novasDescricoes = [...descricoes]
    novasDescricoes[index] = valor
    setDescricoes(novasDescricoes)
  }

  const removerDescricao = (index: number) => {
    if (descricoes.length > 1) {
      const novasDescricoes = descricoes.filter((_, i) => i !== index)
      setDescricoes(novasDescricoes)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Cliente *</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Nome completo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status do Pedido *</Label>
          <Select value={status} onValueChange={setStatus} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="producao">Em Produção</SelectItem>
              <SelectItem value="pronto">Pedido Pronto</SelectItem>
              <SelectItem value="enviado">Pedido Enviado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataPedido">Data do Pedido *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataPedido ? format(dataPedido, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dataPedido} onSelect={setDataPedido} initialFocus locale={ptBR} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="endereco">Endereço *</Label>
          <Textarea
            id="endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required
            placeholder="Endereço completo para entrega"
            rows={2}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="codigoRastreamento">Código de Rastreamento (opcional)</Label>
          <Input
            id="codigoRastreamento"
            value={codigoRastreamento}
            onChange={(e) => setCodigoRastreamento(e.target.value)}
            placeholder="Código de rastreamento da entrega"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Descrição do Pedido *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={adicionarDescricao}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Adicionar Descrição
          </Button>
        </div>

        {descricoes.map((descricao, index) => (
          <div key={index} className="flex gap-2">
            <Textarea
              value={descricao}
              onChange={(e) => atualizarDescricao(index, e.target.value)}
              placeholder={`Descrição do pedido ${index + 1}`}
              rows={3}
              required={index === 0}
            />
            {descricoes.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removerDescricao(index)}
                className="flex-shrink-0 h-10 w-10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex items-center gap-1">
          {pedidoInicial ? "Salvar Alterações" : "Criar Pedido"}
        </Button>
      </div>
    </form>
  )
}

