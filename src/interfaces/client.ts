export interface Client {
  id: number
  nome: string
  numeroDocumento: string
  telefone: string
  celular: string
  email: string
  dadosAdicionais: {
    dataNascimento: Date | string
  }

}