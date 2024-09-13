import { S3 } from '@aws-sdk/client-s3';
import { failure } from '@libs/failure';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { FILES_TABLE_NAME } from '@libs/constants';

const postProcessingFileUpload = async (key: string) => {
  const s3 = new S3();

  const file = await s3.headObject({
    Bucket: process.env.CONTENT_BUCKET,
    Key: key,
  });

  if (!file) {
    return failure(404, 'File Not Found');
  }

  const {
    Metadata: { title },
  } = file;

  const dynamodb = new DynamoDB();
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
