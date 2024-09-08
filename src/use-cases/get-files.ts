import { DynamoDB, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { FILES_TABLE_NAME } from '@libs/constants';

const getFiles = async (cursorId?: string) => {
  const args: QueryCommandInput = {
    TableName: FILES_TABLE_NAME,
    ScanIndexForward: false,
    Limit: 10,
    IndexName: 'TypeIndex',
    KeyConditionExpression: '#type = :type',
    ExpressionAttributeNames: {
      '#type': 'type',
    },
    ExpressionAttributeValues: {
      ':type': { S: 'VIDEO' },
    },
  };

  if (cursorId) {
    const [id, createdAt] = Buffer.from(cursorId, 'base64')
      .toString()
      .split(':');

    args.ExclusiveStartKey = marshall({
      id,
      type: 'VIDEO',
      createdAt: Number(createdAt),
    });
  }

};

export { getFiles };
