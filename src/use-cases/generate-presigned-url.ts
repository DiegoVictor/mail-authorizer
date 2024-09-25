import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { getSignedUrl } from '@infra/services/s3';

const generatePresignedUrl = async (title: string, filename: string) => {
  const key = `${randomUUID()}${extname(filename)}`;

  const url = await getSignedUrl(key, {
    title,
    filename,
  });

  if (process.env.IS_OFFLINE) {
    return url
      .replace(`${process.env.CONTENT_BUCKET}.`, '')
      .replace('files', `${process.env.CONTENT_BUCKET}/files`);
  }

  return url;
};

export { generatePresignedUrl };
