import axios from "axios";
import dayjs from "dayjs";
import { NfeDetails } from "./interfaces/res";
import {  Sale } from "./interfaces/sale";
import { blingLimiter } from "./limiter";
import { retryWithBackOff } from "./rety";
import { SaleDetails } from "./interfaces/sale-details";
import { Client } from "./interfaces/client";
import {SendMessageCommand, SendMessageRequest, SQSClient} from "@aws-sdk/client-sqs"
import { getTokenService } from "./services/token";

async function test() {
  const startOfDay = dayjs().startOf('day').subtract(5, 'day')
  const endOfDay = dayjs().endOf('day').subtract(5, 'day')

  const accessToken = await getTokenService()

   const salesResponse = await blingLimiter.schedule(() =>
    retryWithBackOff(() => 
      axios.get<{data: Sale[]}>('https://api.bling.com.br/Api/v3/pedidos/vendas', {
        headers: {
          Authorization: `Bearer ${accessToken}`
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
  
  for (const sale of sales) {
    const saleDetails = await  blingLimiter.schedule(() => 
        retryWithBackOff(() => 
          axios.get<{data: SaleDetails}>(`https://api.bling.com.br/Api/v3/pedidos/vendas/${sale.id}`, 
    
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              }
          )
        )
      )

      const clientDetails = await blingLimiter.schedule(() => 
          retryWithBackOff(() => 
            axios.get<{data: Client}>(`https://api.bling.com.br/Api/v3/contatos/${sale.contato.id}`, 
      
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                }
            )
          )
        )

        const sqs = new SQSClient({region: "us-east-2"})

        const params: SendMessageRequest =  {
            QueueUrl: "https://sqs.us-east-2.amazonaws.com/025691313279/BlingNaturalPerson.fifo",
            MessageBody: JSON.stringify({
              client: {
                id: clientDetails.data.data.id,
                name: clientDetails.data.data.nome,
                document: clientDetails.data.data.numeroDocumento,
                phone: clientDetails.data.data.telefone,
                email: clientDetails.data.data.email,
                birthDate: clientDetails.data.data.dadosAdicionais.dataNascimento,
              },
              sale: {
                id: saleDetails.data.data.id,
                date: saleDetails.data.data.data,
                total: saleDetails.data.data.total,
                items: saleDetails.data.data.itens.map(item => ({
                  id: item.id,
                  name: item.descricao,
                  quantity: item.quantidade,
                  price: item.valor,
                  totalPrice: item.valorTotal
                }))
              }
              
            }),
            MessageGroupId: "BlingNaturalPerson",
            MessageDeduplicationId: `${dayjs().toISOString()}-${Math.random()}`
        }

        const command = new SendMessageCommand(params)
        const messagesSent = await sqs.send(command)

        console.log(messagesSent.MessageId)
  }

}

test()

