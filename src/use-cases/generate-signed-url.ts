import { failure } from '@infra/http/failure';
import { success } from '@infra/http/success';
import { getOneById } from '@infra/repositories/files';
import { getSignedUrl } from '@infra/services/cloudfront';
import { getSecret } from '@infra/services/secrets-manager';

const generateSignedUrl = async (id: string) => {
  const file = await getOneById(id);

  if (!file) {
    return failure(404, 'File Not Found');
  }

  if (process.env.IS_OFFLINE) {
    return success(200, {
      url: `http://localhost:4566/${process.env.CONTENT_BUCKET}/${file.key}`,
    });
  }

  const privateKey = await getSecret('mailauthorizer-cloudfront-private-key');

  const expiresAt = new Date(Date.now() + 60 * 5 * 1000);
  const url = getSignedUrl(
    { key: file.key, dateLessThan: expiresAt.toISOString() },
    privateKey
  );

  return success(200, { url });
};

export { generateSignedUrl };
