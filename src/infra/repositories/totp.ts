import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ITotp } from '@contracts/totp';

const dynamodb = new DynamoDB({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
});

export const TOTP_TABLE_NAME = 'totp';

export const getOneByEmail = async (email: string) => {
  const { Item } = await dynamodb.getItem({
    TableName: TOTP_TABLE_NAME,
    Key: marshall({
      email,
    }),
  });

  if (Item) {
    return unmarshall(Item);
  }

  return null;
};

export const save = (file: ITotp) =>
  dynamodb.putItem({
    TableName: TOTP_TABLE_NAME,
    Item: marshall(file),
  });

export const deleteByEmail = (email: string) =>
  dynamodb.deleteItem({
    TableName: TOTP_TABLE_NAME,
    Key: marshall({
      email,
    }),
  });
