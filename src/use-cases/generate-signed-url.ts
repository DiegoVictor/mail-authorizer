import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { failure } from '@libs/failure';
import { success } from '@libs/success';
import { FILES_TABLE_NAME } from '@libs/constants';
import { getSignedUrl } from '@infra/services/cloudfront';

const generateSignedUrl = async (id: string) => {
  const dynamodb = new DynamoDB({
    endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
  });
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
