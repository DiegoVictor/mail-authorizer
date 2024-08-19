import { z } from 'zod';
import { APIGatewayProxyEvent } from 'aws-lambda';

export const main = async (event: APIGatewayProxyEvent) => {
  const schema = z.object({
    email: z.string().email(),
    otp: z.string().length(6).optional(),
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
};
