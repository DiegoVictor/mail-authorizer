import { faker } from '@faker-js/faker';
import { postProcessingFileUpload } from '../../../src/use-cases/post-processing-file-upload';
import { IFileType } from '../../../src/contracts/file';

const mockGetMetadataByKey = jest.fn();
jest.mock('@infra/services/s3', () => {
  return {
    getMetadataByKey: (key: string) => mockGetMetadataByKey(key),
  };
});

const mockSave = jest.fn();
jest.mock('@infra/repositories/files', () => {
  return {
    save: (record: Record<string, any>) => mockSave(record),
  };
});

const mockedUUID = faker.string.uuid();
jest.mock('node:crypto', () => {
  return {
    randomUUID: () => mockedUUID,
  };
});

describe('postProcessingFileUpload', () => {
  it('should process file uploaded', async () => {
    const key = faker.system.fileName();

    const metadata = { title: faker.music.songName() };
    mockGetMetadataByKey.mockResolvedValue(metadata);

    const createdAt = Date.now();
    jest.spyOn(Date, 'now').mockReturnValueOnce(createdAt);

    await postProcessingFileUpload(key);

    expect(mockGetMetadataByKey).toHaveBeenCalledWith(key);
    expect(mockSave).toHaveBeenCalledWith({
      id: mockedUUID,
      type: IFileType.VIDEO,
      title: metadata.title,
      key,
      createdAt,
    });
  });

  it('should not process a not found file', async () => {
    mockGetMetadataByKey.mockResolvedValue(undefined);

    const key = faker.system.fileName();
    const response = await postProcessingFileUpload(key);

    expect(mockGetMetadataByKey).toHaveBeenCalledWith(key);
    expect(response).toEqual({
      httpCode: 404,
      response: {
        message: 'File Not Found',
      },
    });
  });
});
