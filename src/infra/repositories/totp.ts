import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { ITotp } from '@contracts/totp';

const dynamodb = new DynamoDB({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
});

export const TOTP_TABLE_NAME = 'totp';

export const save = (file: ITotp) =>
  dynamodb.putItem({
    TableName: TOTP_TABLE_NAME,
    Item: marshall(file),
  });