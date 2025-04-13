import dayjs from "dayjs"
import { blingLimiter } from "../limiter"
import { retryWithBackOff } from "../rety"
import { Sale } from "../interfaces/sale"
import axios from "axios"
import { SaleDetails } from "../interfaces/sale-details"
import { Client } from "../interfaces/client"

export class BlingService {
  
  
  constructor(private accessToken: string) {}

  async listSales(): Promise<Sale[]> {
    const startOfDay = dayjs().startOf('day').subtract(2, 'day')
    const endOfDay = dayjs().endOf('day').subtract(2, 'day')

    try {
      const salesResponse = await blingLimiter.schedule(() =>
        retryWithBackOff(() => 
          axios.get<{data: Sale[]}>('https://api.bling.com.br/Api/v3/pedidos/vendas', {
            headers: {
              Authorization: `Bearer ${this.accessToken}`
            },
            params: {
              dataInicial: startOfDay.format('YYYY-MM-DD'),
              dataFinal: endOfDay.format('YYYY-MM-DD'),
              idsSituacoes: [9]
            }
          })
        )
      )
  
      const sales = salesResponse.data.data.filter(p => p.contato.tipoPessoa === 'F')
      return sales
    } catch (error) {
      console.error("‼️ Erro ao listar vendas", error)
    }

    return []
  }

  async getSaleDetails(saleId: string): Promise<SaleDetails | undefined> {
      try {
        const saleDetails = await blingLimiter.schedule(() => 
          retryWithBackOff(() => 
            axios.get<{data: SaleDetails}>(`https://api.bling.com.br/Api/v3/pedidos/vendas/${Number(saleId)}`, 
      
                {
                  headers: {
                    Authorization: `Bearer ${this.accessToken}`
                  }
                }
            )
          )
        )
  
      return saleDetails.data.data
      } catch (error) {
        console.error("‼️ Erro ao buscar detalhes da venda", error)
      } 
  }

  async getNaturalPerson(contactId: number): Promise<Client | undefined> {
    try {
      const clientDetails = await blingLimiter.schedule(() => 
        retryWithBackOff(() => 
          axios.get<{data: Client}>(`https://api.bling.com.br/Api/v3/contatos/${contactId}`, 
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`
              }
            }
          )
        )
      ) 
    
      return clientDetails.data.data
    } catch (error) {
      console.error("‼️ Erro ao buscar cliente", error)
    }
  }
}