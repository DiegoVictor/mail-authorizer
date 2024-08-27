import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import { verify } from 'jsonwebtoken';

export const main = async (event: APIGatewayProxyEventHeaders) => {
  console.log(JSON.stringify(event));

  try {
    const { authorizationToken, methodArn } = event;
    const token = authorizationToken.split(' ').pop();

    verify(token, process.env.JWT_SECRET);
  } catch (err) {
  }
};
