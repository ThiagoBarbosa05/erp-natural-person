import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

export async function getTokenService() {
    const db = await new DynamoDBClient({
      region: "us-east-2"
    })

    const getTokenCommand = new GetItemCommand({
      TableName: "BlingToken",
      Key: {id: {S: 'Bling'}}
    })

    const response = await db.send(getTokenCommand)

    return response.Item?.tokens?.M?.access_token.S
}