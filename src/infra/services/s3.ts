import { S3 } from '@aws-sdk/client-s3';

export const FILES_UPLOAD_FOLDER_NAME = 'files';

const s3 = new S3({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
  forcePathStyle: process.env.IS_OFFLINE ? true : undefined,
});
