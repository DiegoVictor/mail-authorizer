import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { failure } from '@libs/failure';
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
    return failure(404, 'File not found');
  }

  try {
    const secretsManager = new SecretsManager();
    const { SecretString: CLOUDFRONT_PRIVATE_KEY } =
      await secretsManager.getSecretValue({
        SecretId: 'mailauthorizer-cloudfront-private-key',
      });
  } catch (err) {
    console.error(err);
    return failure(500, 'Internal Server Error');
  }
};

export { generateSignedUrl };
