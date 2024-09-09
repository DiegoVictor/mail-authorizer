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

  const dynamodb = new DynamoDB();

  const { Items, LastEvaluatedKey } = await dynamodb.query(args);
  if (LastEvaluatedKey) {
    const { id, createdAt } = unmarshall(LastEvaluatedKey);

    return {
      data: Items.map((item) => unmarshall(item)),
      cursorId: Buffer.from(`${id}:${createdAt}`).toString('base64'),
    };
  }

  return {
    data: Items.map((item) => unmarshall(item)),
  };
};

export { getFiles };