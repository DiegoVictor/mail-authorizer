import { faker } from '@faker-js/faker';
import { getFiles } from '../../../src/use-cases/get-files';
import { IFileType } from '../../../src/contracts/file';

const mockGetManyPaginated = jest.fn();
jest.mock('@infra/repositories/files', () => {
  return {
    getManyPaginated: (limit: number, cursorId?: string) =>
      mockGetManyPaginated(limit, cursorId),
  };
});

describe('getFiles', () => {
  it('should return a list of files', async () => {
    const file = {
      id: faker.string.uuid(),
      type: IFileType.VIDEO,
      title: faker.music.songName(),
      key: `${faker.string.uuid()}.mp4`,
      createdAt: faker.date.recent().getTime().toString(),
    };
    mockGetManyPaginated.mockResolvedValue({ data: [file] });

    const response = await getFiles();

    expect(mockGetManyPaginated).toHaveBeenCalledWith(10, undefined);
    expect(response).toEqual({ data: [file] });
  });

  it('should return files after cursorId', async () => {
    const file = {
      id: faker.string.uuid(),
      type: IFileType.VIDEO,
      title: faker.music.songName(),
      key: `${faker.string.uuid()}.mp4`,
      createdAt: faker.date.recent().getTime().toString(),
    };

    mockGetManyPaginated.mockResolvedValue({
      data: [file],
    });

    const cursorId = faker.string.uuid();
    const response = await getFiles(cursorId);

    expect(mockGetManyPaginated).toHaveBeenCalledWith(10, cursorId);
    expect(response).toEqual({ data: [file] });
  });

  it('should return cursorId', async () => {
    const file = {
      id: faker.string.uuid(),
      type: IFileType.VIDEO,
      title: faker.music.songName(),
      key: `${faker.string.uuid()}.mp4`,
      createdAt: faker.date.recent().getTime().toString(),
    };
    const cursorId = faker.string.uuid();

    mockGetManyPaginated.mockResolvedValue({
      cursorId,
      data: [file],
    });

    const response = await getFiles();

    expect(mockGetManyPaginated).toHaveBeenCalledWith(10, undefined);
    expect(response).toEqual({
      data: [file],
      cursorId,
    });
  });
});
