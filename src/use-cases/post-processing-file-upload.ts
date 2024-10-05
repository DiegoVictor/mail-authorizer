import { randomUUID } from 'node:crypto';
import { failure } from '@infra/http/failure';
import { getMetadataByKey } from '@infra/services/s3';
import { save } from '@infra/repositories/files';
import { IFileType } from '@contracts/file';

const postProcessingFileUpload = async (key: string) => {
  const metadata = await getMetadataByKey(key);

  if (!metadata) {
    return failure(404, 'File Not Found');
  }

  const { title } = metadata;

  await save({
    id: randomUUID(),
    type: IFileType.VIDEO,
    title,
    key,
    createdAt: Date.now(),
  });
};

export { postProcessingFileUpload };
