import { S3Event } from 'aws-lambda';
import { postProcessingFileUpload } from '@use-cases/post-processing-file-upload';

export const main = async (event: S3Event) => {
  const [
    {
      s3: {
        object: { key },
      },
    },
  ] = event.Records;
  await postProcessingFileUpload(key);

  return {
    statusCode: 201,
    body: '',
  };
};
