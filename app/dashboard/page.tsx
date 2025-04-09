"use client"

import { useState, useEffect } from "react"
import { PlusCircle, DollarSign, LineChart, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Card, CardContent } from "@/components/ui/card"
import PedidoDialog from "@/components/pedido-dialog"
import ListaPedidos from "@/components/lista-pedidos"
import FinancasView from "@/components/financas-view"
import EmailsView from "@/components/emails-view"
import PedidoSearch from "@/components/pedido-search"
import StorageService from "@/services/storage-service"
import type { Pedido } from "@/types/pedido"
import type { Transacao } from "@/types/financas"
import type { Contato } from "@/types/contato"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  // ... todo o conteúdo atual da página principal ...
  // Inicializa a versão do app
  useEffect(() => {
    StorageService.initializeAppVersion()
  }, [])

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pedidoAtual, setPedidoAtual] = useState<Pedido | null>(null)
  const [activeTab, setActiveTab] = useState("pedidos")
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")

  // Carrega dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [pedidosData, transacoesData, contatosData] = await Promise.all([
          StorageService.loadPedidos(),
          StorageService.loadTransacoes(),
          StorageService.loadContatos()
        ])
        
        setPedidos(pedidosData)
        setTransacoes(transacoesData)
        setContatos(contatosData)
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error)
        // Fallback para versão síncrona
        setPedidos(StorageService.syncLoadPedidos())
        setTransacoes(StorageService.syncLoadTransacoes())
        setContatos(StorageService.syncLoadContatos())
        
        toast({
          title: "Atenção",
          description: "Usando armazenamento de dados alternativo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  // Salva dados quando mudam
  useEffect(() => {
    if (!loading && pedidos.length > 0) {
      StorageService.savePedidos(pedidos).catch(error => {
        console.error('Erro ao salvar pedidos:', error)
      })
    }
  }, [pedidos, loading])

  useEffect(() => {
    if (!loading && transacoes.length > 0) {
      StorageService.saveTransacoes(transacoes).catch(error => {
        console.error('Erro ao salvar transações:', error)
      })
    }
  }, [transacoes, loading])

  useEffect(() => {
    if (!loading && contatos.length > 0) {
      StorageService.saveContatos(contatos).catch(error => {
        console.error('Erro ao salvar contatos:', error)
      })
    }
  }, [contatos, loading])

  // Cálculos financeiros
  const totalReceitas = transacoes.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + t.valor, 0)
  const totalDespesas = transacoes.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + t.valor, 0)
  const lucro = totalReceitas - totalDespesas

  const adicionarPedido = (novoPedido: Pedido) => {
    if (pedidoAtual) {
      // Editando pedido existente
      setPedidos(pedidos.map((p) => (p.id === pedidoAtual.id ? novoPedido : p)))

      // Se o e-mail foi adicionado ou alterado, atualiza ou adiciona o contato
      if (novoPedido.email) {
        const contatoExistente = contatos.find((c) => c.email === novoPedido.email)
        if (!contatoExistente) {
          adicionarContato({
            id: novoPedido.id,
            nome: novoPedido.nome,
            email: novoPedido.email,
            telefone: novoPedido.telefone,
            dataCriacao: new Date().toISOString(),
          })
        } else if (contatoExistente.nome !== novoPedido.nome || contatoExistente.telefone !== novoPedido.telefone) {
          // Atualiza o contato se o nome ou telefone mudou
          atualizarContato({
            ...contatoExistente,
            nome: novoPedido.nome,
            telefone: novoPedido.telefone,
          })
        }
      }

      toast({
        title: "Pedido atualizado",
        description: "O pedido foi atualizado com sucesso.",
      })
    } else {
      // Adicionando novo pedido
      setPedidos([...pedidos, novoPedido])

      // Se o pedido tem e-mail, adiciona aos contatos
      if (novoPedido.email) {
        const contatoExistente = contatos.find((c) => c.email === novoPedido.email)
        if (!contatoExistente) {
          adicionarContato({
            id: novoPedido.id,
            nome: novoPedido.nome,
            email: novoPedido.email,
            telefone: novoPedido.telefone,
            dataCriacao: new Date().toISOString(),
          })
        }
      }

      toast({
        title: "Pedido criado",
        description: "O novo pedido foi criado com sucesso.",
      })
    }
    setIsDialogOpen(false)
    setPedidoAtual(null)
  }

  const editarPedido = (pedido: Pedido) => {
    setPedidoAtual(pedido)
    setIsDialogOpen(true)
  }

  const excluirPedido = (id: string) => {
    setPedidos(pedidos.filter((p) => p.id !== id))
    toast({
      title: "Pedido excluído",
      description: "O pedido foi excluído com sucesso.",
      variant: "destructive",
    })
    // Não excluímos o contato quando o pedido é excluído
  }

  const adicionarTransacao = (novaTransacao: Transacao) => {
    setTransacoes([...transacoes, novaTransacao])
    toast({
      title: `${novaTransacao.tipo === "receita" ? "Receita" : "Despesa"} adicionada`,
      description: `${novaTransacao.descricao} foi registrada com sucesso.`,
    })
  }

  const excluirTransacao = (id: string) => {
    setTransacoes(transacoes.filter((t) => t.id !== id))
    toast({
      title: "Transação excluída",
      description: "A transação foi excluída com sucesso.",
      variant: "destructive",
    })
  }

  const editarTransacao = (transacaoAtualizada: Transacao) => {
    setTransacoes(transacoes.map((t) => (t.id === transacaoAtualizada.id ? transacaoAtualizada : t)))
    toast({
      title: "Transação atualizada",
      description: "A transação foi atualizada com sucesso.",
    })
  }

  const adicionarContato = (novoContato: Contato) => {
    setContatos([...contatos, novoContato])
    toast({
      title: "Contato adicionado",
      description: `${novoContato.nome} foi adicionado à lista de contatos.`,
    })
  }

  const atualizarContato = (contatoAtualizado: Contato) => {
    setContatos(contatos.map((c) => (c.id === contatoAtualizado.id ? contatoAtualizado : c)))
  }

  const excluirContato = (id: string) => {
    setContatos(contatos.filter((c) => c.id !== id))
    toast({
      title: "Contato excluído",
      description: "O contato foi excluído com sucesso.",
      variant: "destructive",
    })
  }

  const pedidosEmAndamento = pedidos.filter((p) => p.status === "producao" || p.status === "pronto")
  const pedidosConcluidos = pedidos.filter((p) => p.status === "enviado")

  // Função para filtrar pedidos baseado no termo de busca
  const filtrarPedidos = (pedidos: Pedido[], termo: string) => {
    if (!termo) return pedidos

    const termoLower = termo.toLowerCase()
    return pedidos.filter(
      (pedido) =>
        pedido.nome.toLowerCase().includes(termoLower) ||
        pedido.email?.toLowerCase().includes(termoLower) ||
        pedido.telefone?.toLowerCase().includes(termoLower)
    )
  }

  // Filtrar pedidos baseado no termo de busca
  const pedidosEmAndamentoFiltrados = filtrarPedidos(pedidosEmAndamento, searchTerm)
  const pedidosConcluidosFiltrados = filtrarPedidos(pedidosConcluidos, searchTerm)

  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const handleDataImported = (data: {
    pedidos: Pedido[]
    transacoes: Transacao[]
    contatos: Contato[]
  }) => {
    setPedidos(data.pedidos)
    setTransacoes(data.transacoes)
    setContatos(data.contatos)
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Sistema de Gerenciamento de Pedidos</h1>
                <p className="text-muted-foreground mt-1">Acompanhe o status e detalhes de todos os seus pedidos</p>
              </div>
            </div>
            <div className="mt-4 max-w-md">
              <PedidoSearch onSearch={setSearchTerm} />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPedidoAtual(null)
                  setIsDialogOpen(true)
                }}
                className="flex items-center gap-2 flex-1 md:flex-auto"
              >
                <PlusCircle className="h-4 w-4" />
                Novo Pedido
              </Button>
              <Button onClick={() => setActiveTab("financas")} className="flex items-center gap-2 flex-1 md:flex-auto">
                <DollarSign className="h-4 w-4" />
                Finanças
              </Button>
            </div>
            <Card className="w-full">
              <CardContent className="p-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Receitas</p>
                    <p className="text-sm font-medium text-green-600">{formatarValor(totalReceitas)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Despesas</p>
                    <p className="text-sm font-medium text-red-600">{formatarValor(totalDespesas)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lucro</p>
                    <p className="text-sm font-medium text-blue-600">{formatarValor(lucro)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={() => setActiveTab("emails")} className="w-full flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              E-mails Salvos ({contatos.length})
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pedidos" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="financas" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Finanças
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="mt-6">
            <Tabs defaultValue="andamento" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="andamento">Em Andamento ({pedidosEmAndamentoFiltrados.length})</TabsTrigger>
                <TabsTrigger value="concluidos">Concluídos ({pedidosConcluidosFiltrados.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="andamento" className="mt-6">
                <ListaPedidos pedidos={pedidosEmAndamentoFiltrados} onEdit={editarPedido} onDelete={excluirPedido} />
              </TabsContent>
              <TabsContent value="concluidos" className="mt-6">
                <ListaPedidos pedidos={pedidosConcluidosFiltrados} onEdit={editarPedido} onDelete={excluirPedido} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="financas" className="mt-6">
            <FinancasView
              transacoes={transacoes}
              onAddTransacao={adicionarTransacao}
              onDeleteTransacao={excluirTransacao}
              onEditTransacao={editarTransacao}
              totalReceitas={totalReceitas}
              totalDespesas={totalDespesas}
              lucro={lucro}
            />
          </TabsContent>

          <TabsContent value="emails" className="mt-6">
            <EmailsView contatos={contatos} onDelete={excluirContato} />
          </TabsContent>
        </Tabs>
      </div>

      <PedidoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        pedidoInicial={pedidoAtual}
        onSubmit={adicionarPedido}
      />

      <Toaster />
    </main>
  )
} 