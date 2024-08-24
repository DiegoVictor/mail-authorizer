import { z } from 'zod';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendOtp } from '@use-cases/send-otp';
import { validateOtp } from '@use-cases/validate-otp';
import { createToken } from '@use-cases/create-token';

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

  const { email, otp } = data;
  if (otp) {
    const result = await validateOtp(email, otp);

    if (!result.isSuccess()) {
      return {
        statusCode: result.httpCode,
        body: JSON.stringify(result.response),
      };
    }

    const token = createToken(email);
    return {
      statusCode: result.httpCode,
      body: JSON.stringify({ token }),
    };
  }

  const result = await sendOtp(email);
  return {
    statusCode: result.httpCode,
    body: JSON.stringify(result.response),
  };
};
