import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import * as request from '@aws-sdk/s3-request-presigner';

export const FILES_UPLOAD_FOLDER_NAME = 'files';

const s3 = new S3({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
  forcePathStyle: process.env.IS_OFFLINE ? true : undefined,
});

export const getSignedUrl = (
  filename: string,
  Metadata?: Record<string, string>
) =>
  request.getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.CONTENT_BUCKET,
      Key: `${FILES_UPLOAD_FOLDER_NAME}/${filename}`,
      Metadata,
    })
  );
