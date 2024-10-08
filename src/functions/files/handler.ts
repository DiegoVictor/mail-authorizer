import { APIGatewayProxyEvent } from 'aws-lambda';
import { z } from 'zod';
import { getFiles } from '@use-cases/get-files';
import { generatePresignedUrl } from '@use-cases/generate-presigned-url';

export const main = async (event: APIGatewayProxyEvent) => {
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

      const { title, filename } = data;
      const url = await generatePresignedUrl(title, filename);

      return {
        statusCode: 200,
        body: JSON.stringify({
          url,
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
