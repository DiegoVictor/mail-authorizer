import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
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

};

export { generateSignedUrl };
