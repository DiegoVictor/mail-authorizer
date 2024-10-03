import { DynamoDB, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { IFile, IFileType } from '@contracts/file';

const dynamodb = new DynamoDB({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
});

export const FILES_TABLE_NAME = 'files';

export const getOneById = async (id: string) => {
  const { Items } = await dynamodb.query({
    TableName: FILES_TABLE_NAME,
    KeyConditions: {
      id: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [marshall(id)],
      },
    },
    ScanIndexForward: false,
    Limit: 1,
  });

  if (Array.isArray(Items) && Items.length > 0) {
    return unmarshall(Items.shift());
  }

  return null;
};

export const getManyPaginated = async (Limit = 10, cursorId?: string) => {
  const args: QueryCommandInput = {
    TableName: FILES_TABLE_NAME,
    ScanIndexForward: false,
    Limit,
    IndexName: 'TypeIndex',
    KeyConditionExpression: '#type = :type',
    ExpressionAttributeNames: {
      '#type': 'type',
    },
    ExpressionAttributeValues: {
      ':type': { S: IFileType.VIDEO },
    },
  };

  if (cursorId) {
    const [id, createdAt] = Buffer.from(cursorId, 'base64')
      .toString()
      .split(':');

    args.ExclusiveStartKey = marshall({
      id,
      type: IFileType.VIDEO,
      createdAt: Number(createdAt),
    });
  }

  const { Items, LastEvaluatedKey } = await dynamodb.query(args);
  const data = Items.map((item) => unmarshall(item));

  if (LastEvaluatedKey) {
    const { id, createdAt } = unmarshall(LastEvaluatedKey);
    return {
      data,
      cursorId: Buffer.from(`${id}:${createdAt}`).toString('base64'),
    };
  }

  return {
    data,
  };
};

export const save = (file: IFile) =>
  dynamodb.putItem({
    TableName: FILES_TABLE_NAME,
    Item: marshall(file),
  });
