import { DynamoDB } from '@aws-sdk/client-dynamodb';
const dynamodb = new DynamoDB({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
});

export const FILES_TABLE_NAME = 'files';
