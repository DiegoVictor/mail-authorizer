import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { verify } from 'jsonwebtoken';

export const main = async (event: APIGatewayProxyEventHeaders) => {
  console.log(JSON.stringify(event));

  try {
    const { authorizationToken, methodArn } = event;
    const token = authorizationToken.split(' ').pop();

    verify(token, process.env.JWT_SECRET);
    return {
      principalId: randomUUID(),
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: methodArn,
          },
        ],
      },
    };
  } catch (err) {
  }
};
