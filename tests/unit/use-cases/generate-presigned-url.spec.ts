import { faker } from '@faker-js/faker';
import { extname } from 'path';
import { generatePresignedUrl } from '../../../src/use-cases/generate-presigned-url';
import { FILES_UPLOAD_FOLDER_NAME } from '../../../src/infra/services/s3';

const mockGetSignedUrl = jest.fn();
jest.mock('@infra/services/s3', () => {
  return {
    getSignedUrl: (key: string, options: Record<string, any>) =>
      mockGetSignedUrl(key, options),
  };
});

const mockedUUID = faker.string.uuid();
jest.mock('node:crypto', () => {
  return {
    randomUUID: () => mockedUUID,
  };
});

const OLD_ENV = process.env;

describe('generatePresignedUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = OLD_ENV;
  });

  it('should be able to generate a presigned URL', async () => {
    const title = faker.music.songName();
    const filename = faker.system.fileName();

    const presignedUrl = faker.internet.url();
    mockGetSignedUrl.mockResolvedValue(presignedUrl);

    const url = await generatePresignedUrl(title, filename);

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      `${mockedUUID}${extname(filename)}`,
      {
        title,
        filename,
      }
    );
    expect(url).toBe(presignedUrl);
  });

  it('should be able to generate a presigned URL for OFFLINE environment', async () => {
    const title = faker.music.songName();
    const filename = faker.system.fileName();

    process.env.CONTENT_BUCKET = 'content-bucket';
    const presignedUrl = `https://${
      process.env.CONTENT_BUCKET
    }.s3.amazonaws.com/${FILES_UPLOAD_FOLDER_NAME}/${mockedUUID}${extname(
      filename
    )}`;
    mockGetSignedUrl.mockResolvedValue(presignedUrl);

    process.env.IS_OFFLINE = '1';
    const url = await generatePresignedUrl(title, filename);

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      `${mockedUUID}${extname(filename)}`,
      {
        title,
        filename,
      }
    );
    expect(url).toBe(
      presignedUrl
        .replace(`${process.env.CONTENT_BUCKET}.`, '')
        .replace('files', `${process.env.CONTENT_BUCKET}/files`)
    );
  });
});
