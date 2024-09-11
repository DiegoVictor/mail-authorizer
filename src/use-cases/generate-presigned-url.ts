import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { FILES_UPLOAD_FOLDER_NAME } from '@libs/constants';

const generatePresignedUrl = async (title: string, filename: string) => {
  const key = `${FILES_UPLOAD_FOLDER_NAME}/${randomUUID()}${extname(filename)}`;

  const s3 = new S3();
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

  return url;
};

export { generatePresignedUrl };
