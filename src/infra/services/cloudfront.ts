import * as Cloudfront from '@aws-sdk/cloudfront-signer';
import { getSecret } from './secrets-manager';

export const getSignedUrl = async (key: string, dateLessThan: string) => {
  const CLOUDFRONT_PRIVATE_KEY = await getSecret(
    'mailauthorizer-cloudfront-private-key'
  );

  return Cloudfront.getSignedUrl({
    url: `${process.env.CLOUDFRONT_DOMAIN}/${key}`,
    dateLessThan,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: CLOUDFRONT_PRIVATE_KEY,
  });
};
