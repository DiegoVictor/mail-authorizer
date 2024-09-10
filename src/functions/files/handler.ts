import { APIGatewayProxyEvent } from 'aws-lambda';
import { getFiles } from '@use-cases/get-files';
import { z } from 'zod';

export const main = async (event: APIGatewayProxyEvent) => {
  console.log(JSON.stringify(event));

  switch (event.httpMethod) {
    case 'POST': {
      const schema = z.object({
        title: z.string(),
        filename: z.string(),
      });
      const { success, error, data } = schema.safeParse(JSON.parse(event.body));

      if (!success) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Validation Failed',
            issues: error.issues,
          }),
        };
      }
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
