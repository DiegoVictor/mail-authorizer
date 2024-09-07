import { APIGatewayProxyEvent } from 'aws-lambda';

export const main = async (event: APIGatewayProxyEvent) => {
  console.log(JSON.stringify(event));

  switch (event.httpMethod) {
    default:
    case 'GET': {
    }
  }
};
