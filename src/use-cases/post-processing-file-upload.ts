import { S3 } from '@aws-sdk/client-s3';
import { failure } from '@libs/failure';
const postProcessingFileUpload = async (key: string) => {
  const s3 = new S3();

  const file = await s3.headObject({
    Bucket: process.env.CONTENT_BUCKET,
    Key: key,
  });

  if (!file) {
    return failure(404, 'File Not Found');
  }
};

export { postProcessingFileUpload };
