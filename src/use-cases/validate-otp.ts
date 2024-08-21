import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const validateOtp = async (email: string, otp: string) => {
  const dynamodb = new DynamoDB();
  const totp = await dynamodb
    .getItem({
      TableName: 'totp',
      Key: marshall({
        email,
      }),
    })
    .then(({ Item }) => unmarshall(Item));
};

export { validateOtp };
