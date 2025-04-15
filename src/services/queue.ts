import { SendMessageCommand, SendMessageRequest, SQSClient } from "@aws-sdk/client-sqs"
import dayjs from "dayjs"

type SendMessageInput = {
  client: {
    id: number
    name: string
    document: string
    phone: string
    email: string
    birthDate: string | Date
    vendedor: number
  },
  sale: {
    id: number
    date: string | Date
    total: number
    items: {
    id: number
    name: string
    quantity: number
    price: number
    totalPrice: number
    }[]      
  }
}

export class QueueService {

  private client: SQSClient

  constructor() {
    this.client = new SQSClient({region: "us-east-2"})
  }

  async sendMessage(message: SendMessageInput) {
          const params: SendMessageRequest =  {
            QueueUrl: "https://sqs.us-east-2.amazonaws.com/025691313279/BlingNaturalPerson.fifo",
            MessageBody: JSON.stringify(message),
            MessageGroupId: "BlingNaturalPerson",
            MessageDeduplicationId: `${dayjs().toISOString()}-${Math.random()}`
        }

        const command = new SendMessageCommand(params)

        try {
          await this.client.send(command)
        } catch (error) {
          console.error("‼️ Erro ao enviar mensagem para a fila", error)
        }
  }
}