import { failure } from '@libs/failure';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'node:crypto';
import { FILES_TABLE_NAME } from '@libs/constants';

const postProcessingFileUpload = async (key: string) => {
  const metadata = await getMetadataByKey(key);

  if (!metadata) {
    return failure(404, 'File Not Found');
  }

  const {
    Metadata: { title },
  } = file;

  const dynamodb = new DynamoDB({
    endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
  });
  await dynamodb.putItem({
    TableName: FILES_TABLE_NAME,
    Item: marshall({
      id: randomUUID(),
      type: 'VIDEO',
      title,
      key,
      createdAt: Date.now(),
    }),
  });
};

export { postProcessingFileUpload };
