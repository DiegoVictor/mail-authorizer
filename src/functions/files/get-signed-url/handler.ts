import { APIGatewayProxyEvent } from 'aws-lambda';
import { z } from 'zod';
import { generateSignedUrl } from '@use-cases/generate-signed-url';

export const main = async (event: APIGatewayProxyEvent) => {
  const schema = z.object({
    id: z.string().uuid(),
  });
  const { success, error, data } = schema.safeParse(event.pathParameters);

  if (!success) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Failed',
        issues: error.issues,
      }),
    };
  }

  const { id } = data;
  const result = await generateSignedUrl(id);
  return {
    statusCode: result.httpCode,
    body: JSON.stringify(result.response),
  };
};
