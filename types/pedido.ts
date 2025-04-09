export interface Pedido {
  id: string
  nome: string
  telefone: string
  email?: string // Adicionado campo de e-mail
  status: string // "producao" | "pronto" | "enviado"
  endereco: string
  dataPedido: string // ISO string
  codigoRastreamento?: string
  descricoes: string[]
  dataCriacao: string // ISO string
}

