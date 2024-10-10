import { faker } from '@faker-js/faker';
import { generateSignedUrl } from '../../../src/use-cases/generate-signed-url';

const mockgetOneById = jest.fn();
jest.mock('@infra/repositories/files', () => {
  return {
    getOneById: (id: string) => mockgetOneById(id),
  };
});

const mockGetSignedUrl = jest.fn();
jest.mock('@infra/services/cloudfront', () => {
  return {
    getSignedUrl: (key: string, expiration: string) =>
      mockGetSignedUrl(key, expiration),
  };
});

const mockGetSecret = jest.fn();
jest.mock('@infra/services/secrets-manager', () => {
  return {
    getSecret: (secret: string) => mockGetSecret(secret),
  };
});

const OLD_ENV = {
  ...process.env,
};

describe('generateSignedUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = OLD_ENV;
  });

  it('should return a signed URL', async () => {
    const file = {
      id: faker.string.uuid(),
      key: faker.system.fileName(),
    };
    mockgetOneById.mockResolvedValue(file);

    process.env.CONTENT_BUCKET = 'content-bucket';
    const url = `https://${process.env.CONTENT_BUCKET}.cloudfront.awsamazon.com/${file.key}`;
    mockGetSignedUrl.mockReturnValue(url);

    const privateKey = faker.string.alphanumeric();
    mockGetSecret.mockResolvedValue(privateKey);

    const { response } = await generateSignedUrl(file.id);

    expect(mockgetOneById).toHaveBeenCalledWith(file.id);
    expect(mockGetSecret).toHaveBeenCalledWith(
      'mailauthorizer-cloudfront-private-key'
    );
    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      { key: file.key, dateLessThan: expect.any(String) },
      privateKey
    );
    expect(response).toHaveProperty('url', url);
  });

  it('should return a signed URL for OFFLINE environment', async () => {
    const file = {
      id: faker.string.uuid(),
      key: faker.system.fileName(),
    };
    mockgetOneById.mockResolvedValue(file);

    process.env.CONTENT_BUCKET = 'content-bucket';
    process.env.IS_OFFLINE = '1';
    const { response } = await generateSignedUrl(file.id);

    expect(mockgetOneById).toHaveBeenCalledWith(file.id);
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
    expect(response).toHaveProperty(
      'url',
      `http://localhost:4566/${process.env.CONTENT_BUCKET}/${file.key}`
    );
  });

  it('should not return a signed URL if file is not found', async () => {
    mockgetOneById.mockResolvedValue(undefined);

    const id = faker.string.uuid();
    const response = await generateSignedUrl(id);

    expect(mockgetOneById).toHaveBeenCalledWith(id);
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
    expect(response).toEqual({
      httpCode: 404,
      response: {
        message: 'File Not Found',
      },
    });
  });
});
