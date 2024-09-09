import { APIGatewayProxyEvent } from 'aws-lambda';
import { getFiles } from '@use-cases/get-files';

export const main = async (event: APIGatewayProxyEvent) => {
  console.log(JSON.stringify(event));

  switch (event.httpMethod) {
    default:
    case 'GET': {
      const { data, cursorId } = await getFiles(
        event.queryStringParameters?.cursorId ?? null
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          data,
          cursorId,
        }),
      };
    }
  }
};
