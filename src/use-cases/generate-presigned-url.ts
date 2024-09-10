import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { FILES_UPLOAD_FOLDER_NAME } from '@libs/constants';

const generatePresignedUrl = async (title: string, filename: string) => {
  const key = `${FILES_UPLOAD_FOLDER_NAME}/${randomUUID()}${extname(filename)}`;
};

export { generatePresignedUrl };
