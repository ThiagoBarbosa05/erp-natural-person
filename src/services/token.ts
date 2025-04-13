import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

export async function getTokenService() {
    const db =  new DynamoDBClient({
      region: "us-east-2"
    })

    const getTokenCommand = new GetItemCommand({
      TableName: "BlingToken",
      Key: {id: {S: 'Bling'}}
    })

    try {
      const response = await db.send(getTokenCommand)

      return response.Item?.tokens?.M?.access_token.S
    } catch (error) {
      console.error('‼️ Erro ao buscar access token', error)
    }
    
}