
import { getTokenService } from "./services/token";
import { BlingService } from "./services/bling";
import { DynamoRepository } from "./repository/dynamo";
import { QueueService } from "./services/queue";

async function test() {

  const dynamo = new DynamoRepository()
  const queue = new QueueService()
  
  const accessToken = await getTokenService()

  if(!accessToken) return

  const bling = new BlingService(accessToken)

  console.info("⏳ Buscando vendas no Bling")
  const sales = await bling.listSales()
  console.info("✅ Vendas encontradas: ", sales.map(sale => sale.id))

  if (sales.length <= 0) {
    console.info("❌ Nenhuma venda encontrada")
    return
  }
  
  for (const sale of sales) {

    console.info(`⏳ Verificando se a venda ${sale.id} já foi processada`)
    const {id: existingSale} = await dynamo.getSale(sale.id)
    console.info("✅ Verificação concluída, venda já processada: ", existingSale ? existingSale : null)

    if(existingSale) {
      console.info(`⏳ Buscando detalhes da venda: ${sale.id}`)
      const saleDetails = await bling.getSaleDetails(sale.id.toString())
      console.info(`✅ Detalhes da venda ${saleDetails?.id} encontrados`)

      if(!saleDetails) return

      console.info(`⏳ Buscando detalhes do cliente: ${saleDetails.contato.nome}`)
      const naturalPerson = await bling.getNaturalPerson(saleDetails.contato.id)
      console.info(`✅ Detalhes do cliente ${naturalPerson?.nome} encontrados`)
      if (!naturalPerson) return

      console.info("⏳ Enviando cliente e venda para a fila de processamento (CRM)")
      await queue.sendMessage({
        client: {
          id: naturalPerson.id,
          name: naturalPerson.nome,
          document: naturalPerson.numeroDocumento,
          birthDate: naturalPerson.dadosAdicionais.dataNascimento,
          email: naturalPerson.email,
          phone: naturalPerson.telefone,
          vendedor: saleDetails.vendedor.id
          },
        sale: {
          id: saleDetails.id,
          date: saleDetails.data,
          items: saleDetails.itens.map(item => ({
            id: item.id,
            name: item.descricao,
            quantity: item.quantidade,
            price: item.valor,
            totalPrice: item.valorTotal
          })),
          total: saleDetails.total
          }
        }) 

      console.info("⏳ Armazenando venda processada: ", sale.id)
      await dynamo.saveSale({
        id: sale.id.toString(),
        name: sale.contato.nome
      })
    }  
  }
}


test()

