import { DynamoDB } from '@aws-sdk/client-dynamodb';

const generateSignedUrl = async (id: string) => {
  const dynamodb = new DynamoDB();
};

export { generateSignedUrl };
