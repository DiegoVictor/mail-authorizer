import * as Cloudfront from '@aws-sdk/cloudfront-signer';

interface ISignedUrlParams {
  key: string;
  dateLessThan: string;
}

export const getSignedUrl = (
  { key, dateLessThan }: ISignedUrlParams,
  privateKey: string
) =>
  Cloudfront.getSignedUrl({
    url: `${process.env.CLOUDFRONT_DOMAIN}/${key}`,
    dateLessThan,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey,
  });
