import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { TOTP_TABLE_NAME } from '@libs/constants';
import { failure } from '@libs/failure';
import { success } from '@libs/success';
import { deleteByEmail } from '@infra/repositories/totp';

const validateOtp = async (email: string, otp: string) => {
  const dynamodb = new DynamoDB({
    endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
  });
  const totp = await dynamodb
    .getItem({
      TableName: TOTP_TABLE_NAME,
      Key: marshall({
        email,
      }),
    })
    .then(({ Item }) => Item && unmarshall(Item));

  if (!totp || totp.otp !== otp) {
    return failure(400, 'Invalid code');
  }

  const now = new Date();
  const expiresAt = new Date(totp.expiresAt);
  if (expiresAt < now) {
    return failure(400, 'Code expired');
  }

  await deleteByEmail(email);

  return success();
};

export { validateOtp };
