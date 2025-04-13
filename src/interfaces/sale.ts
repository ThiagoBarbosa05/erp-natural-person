export interface Sale {
  id: number
  data: Date | string
  total: number
  contato: {
    id: number
    nome: string
    numeroDocumento: string
    tipoPessoa: string
  }
}