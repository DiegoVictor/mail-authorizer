import { APIGatewayProxyEventHeaders } from 'aws-lambda';
export const main = async (event: APIGatewayProxyEventHeaders) => {
  console.log(JSON.stringify(event));

};
