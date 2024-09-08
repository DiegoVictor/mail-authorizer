import { DynamoDB, QueryCommandInput } from '@aws-sdk/client-dynamodb';

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
};

export { getFiles };
