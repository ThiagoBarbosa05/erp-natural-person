export interface SaleDetails {
  id: number
  data: Date | string
  total: number
  contato: {
    id: number
    nome: string
    numeroDocumento: string
    tipoPessoa: string
  }
    itens: {
      id: number
      codigo: string
      descricao: string
      quantidade: number
      valor: number
      valorTotal: number
    }[]
    vendedor: {
      id: number
    }
  }
