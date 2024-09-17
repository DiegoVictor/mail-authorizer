import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { FILES_UPLOAD_FOLDER_NAME } from '@libs/constants';

const generatePresignedUrl = async (title: string, filename: string) => {
  const key = `${FILES_UPLOAD_FOLDER_NAME}/${randomUUID()}${extname(filename)}`;

  const s3 = new S3({
    endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
  });
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.CONTENT_BUCKET,
      Key: key,
      Metadata: {
        title,
        filename,
      },
    })
  );

  if (process.env.IS_OFFLINE) {
    return url
      .replace(`${process.env.CONTENT_BUCKET}.`, '')
      .replace('files', `${process.env.CONTENT_BUCKET}/files`);
  }

  return url;
};

export { generatePresignedUrl };
