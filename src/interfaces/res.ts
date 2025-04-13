export interface NfeDetails {
  id: number
  numero: string
  dataEmissao: Date | string
  contato: {
    id: number
    nome: string
    numeroDocumento: string
    ie: string
    telefone: string
    email: string
    endereco: {
      endereco: string
      numero: string
      complemento: string
      bairro: string
      cep: string
      municipio: string
      uf: string
    }
  }
    valorNota: number
    vendedor: {
      id: number
    }
    itens: {
      codigo: string
      descricao: string
      quantidade: number
      valor: number
      valorTotal: number
    }[]
  
}

export interface BlingContact {
  id: number
  nome: string
  numeroDocumento: string
  ie: string
  telefone: string
  email: string
  endereco: BlingAddress
}
export interface BlingAddress {
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  municipio: string
  uf: string
}
interface AddressDetails {
  geral: BlingAddress
}

export interface BlingContactDetails {
  id: number
  nome: string
  numeroDocumento: string
  celular: string
  telefone: string
  fantasia: string
  ie: string
  email: string
  endereco: AddressDetails
  tiposContato: {
    id: number
    descricao: string
  }
  vendedor: {
    id: number
  }
}
export interface BlingNfe {
  id: number
  numero: string
  contato: BlingContact
}
