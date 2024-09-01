import { APIGatewayProxyEvent } from 'aws-lambda';
import { z } from 'zod';

export const main = async (event: APIGatewayProxyEvent) => {
  console.log(JSON.stringify(event));

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
};
