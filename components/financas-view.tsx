"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Trash2, TrendingUp, TrendingDown, DollarSign, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import type { Transacao } from "@/types/financas"

interface FinancasViewProps {
  transacoes: Transacao[]
  onAddTransacao: (transacao: Transacao) => void
  onDeleteTransacao: (id: string) => void
  onEditTransacao: (transacao: Transacao) => void
  totalReceitas: number
  totalDespesas: number
  lucro: number
}

export default function FinancasView({
  transacoes,
  onAddTransacao,
  onDeleteTransacao,
  onEditTransacao,
  totalReceitas,
  totalDespesas,
  lucro,
}: FinancasViewProps) {
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [tipo, setTipo] = useState<"receita" | "despesa">("receita")
  const [data, setData] = useState<Date>(new Date())
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<string | null>(null)
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<Transacao | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!descricao || !valor) return

    if (transacaoParaEditar) {
      // Editando transação existente
      onEditTransacao({
        ...transacaoParaEditar,
        descricao,
        valor: Number.parseFloat(valor),
        tipo,
        data: data.toISOString(),
      })
    } else {
      // Adicionando nova transação
      const novaTransacao: Transacao = {
        id: uuidv4(),
        descricao,
        valor: Number.parseFloat(valor),
        tipo,
        data: data.toISOString(),
      }
      onAddTransacao(novaTransacao)
    }

    // Limpar formulário
    setDescricao("")
    setValor("")
    setTipo("receita")
    setData(new Date())
    setTransacaoParaEditar(null)
  }

  const editarTransacao = (transacao: Transacao) => {
    setTransacaoParaEditar(transacao)
    setDescricao(transacao.descricao)
    setValor(transacao.valor.toString())
    setTipo(transacao.tipo)
    setData(new Date(transacao.data))
  }

  const cancelarEdicao = () => {
    setTransacaoParaEditar(null)
    setDescricao("")
    setValor("")
    setTipo("receita")
    setData(new Date())
  }

  const confirmarExclusao = (id: string) => {
    setTransacaoParaExcluir(id)
  }

  const cancelarExclusao = () => {
    setTransacaoParaExcluir(null)
  }

  const executarExclusao = () => {
    if (transacaoParaExcluir) {
      onDeleteTransacao(transacaoParaExcluir)
      setTransacaoParaExcluir(null)
    }
  }

  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const receitas = transacoes.filter((t) => t.tipo === "receita")
  const despesas = transacoes.filter((t) => t.tipo === "despesa")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatarValor(totalReceitas)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatarValor(totalDespesas)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatarValor(lucro)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{transacaoParaEditar ? "Editar Transação" : "Nova Transação"}</CardTitle>
            <CardDescription>Registre receitas e despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Transação</Label>
                <Select value={tipo} onValueChange={(value: "receita" | "despesa") => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  placeholder="Ex: Venda de produtos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data ? format(data, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={data}
                      onSelect={(date) => date && setData(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2">
                {transacaoParaEditar && (
                  <Button type="button" variant="outline" className="flex-1" onClick={cancelarEdicao}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" className="flex-1">
                  {transacaoParaEditar ? "Salvar Alterações" : "Adicionar Transação"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="receitas">Receitas</TabsTrigger>
              <TabsTrigger value="despesas">Despesas</TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="mt-4 space-y-4">
              {transacoes.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma transação registrada.</p>
              ) : (
                transacoes.map((transacao) => (
                  <TransacaoItem 
                    key={transacao.id} 
                    transacao={transacao} 
                    onDelete={confirmarExclusao}
                    onEdit={editarTransacao}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="receitas" className="mt-4 space-y-4">
              {receitas.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma receita registrada.</p>
              ) : (
                receitas.map((transacao) => (
                  <TransacaoItem 
                    key={transacao.id} 
                    transacao={transacao} 
                    onDelete={confirmarExclusao}
                    onEdit={editarTransacao}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="despesas" className="mt-4 space-y-4">
              {despesas.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma despesa registrada.</p>
              ) : (
                despesas.map((transacao) => (
                  <TransacaoItem 
                    key={transacao.id} 
                    transacao={transacao} 
                    onDelete={confirmarExclusao}
                    onEdit={editarTransacao}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={!!transacaoParaExcluir} onOpenChange={cancelarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
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

interface TransacaoItemProps {
  transacao: Transacao
  onDelete: (id: string) => void
  onEdit: (transacao: Transacao) => void
}

function TransacaoItem({ transacao, onDelete, onEdit }: TransacaoItemProps) {
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{transacao.descricao}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(transacao.data), "PPP", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className={`font-medium ${transacao.tipo === "receita" ? "text-green-600" : "text-red-600"}`}>
              {transacao.tipo === "receita" ? "+" : "-"}
              {formatarValor(transacao.valor)}
            </p>
            <Button variant="ghost" size="icon" onClick={() => onEdit(transacao)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(transacao.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

