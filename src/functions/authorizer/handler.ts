import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import { randomUUID } from 'node:crypto';
import { verify } from 'jsonwebtoken';

export const main = async (event: APIGatewayProxyEventHeaders) => {
  const { authorizationToken, methodArn } = event;

  try {
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
    return {
      principalId: randomUUID(),
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: methodArn,
          },
        ],
      },
    };
  }
};
