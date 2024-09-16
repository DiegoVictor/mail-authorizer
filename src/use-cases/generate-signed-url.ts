import { DynamoDB } from '@aws-sdk/client-dynamodb';
import * as CloudFront from '@aws-sdk/cloudfront-signer';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { failure } from '@libs/failure';
import { success } from '@libs/success';
import { FILES_TABLE_NAME } from '@libs/constants';

const generateSignedUrl = async (id: string) => {
  const dynamodb = new DynamoDB();
  const file = await dynamodb
    .query({
      TableName: FILES_TABLE_NAME,
      KeyConditions: {
        id: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [marshall(id)],
        },
      },
      ScanIndexForward: false,
      Limit: 1,
    })
    .then(({ Items }) => {
      if (Array.isArray(Items) && Items.length > 0) {
        return unmarshall(Items.shift());
      }

      return null;
    });

  if (!file) {
    return failure(404, 'File Not Found');
  }

  const secretsManager = new SecretsManager();
  const { SecretString: CLOUDFRONT_PRIVATE_KEY } =
    await secretsManager.getSecretValue({
      SecretId: 'mailauthorizer-cloudfront-private-key',
    });

  const expiresIn = new Date(Date.now() + 60 * 5 * 1000);
  const url = CloudFront.getSignedUrl({
    url: `${process.env.CLOUDFRONT_DOMAIN}/${file.key}`,
    dateLessThan: expiresIn.toISOString(),
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: CLOUDFRONT_PRIVATE_KEY,
  });

  return success(200, { url });
};

export { generateSignedUrl };
