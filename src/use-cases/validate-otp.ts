import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { failure } from '@libs/failure';
import { success } from '@libs/success';

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

  if (!totp || totp.otp !== otp) {
    return failure(400, 'Invalid code');
  }

  const now = new Date();
  const expiresAt = new Date(totp.expiresAt);
  if (expiresAt < now) {
    return failure(400, 'Code expired');
  }

  await dynamodb.deleteItem({
    TableName: 'totp',
    Key: marshall({
      email,
    }),
  });

  return success();
};

export { validateOtp };
