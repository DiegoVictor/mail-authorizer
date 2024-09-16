import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { SES } from '@aws-sdk/client-ses';
import { marshall } from '@aws-sdk/util-dynamodb';
import { TOTP } from 'totp-generator';
import { failure } from '@libs/failure';
import { success } from '@libs/success';
import { TOTP_TABLE_NAME } from '@libs/constants';

const sendOtp = async (email: string) => {
  const timestamp = Date.now() + 30 * 1000;
  const { expires, otp } = TOTP.generate(process.env.TOTP_KEY, {
    period: 5 * 60,
    timestamp,
  });

  const ses = new SES();
  const {
    $metadata: { httpStatusCode },
  } = await ses.sendEmail({
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data:
            '<div style="font-family: Roboto, sans-serif;padding: 15px 15px">' +
            '<div><p>Hi,</p><br /><p>Here is your validation code:</p>' +
            `<span style="display:inline-block;font-size: 32px;font-weight: bold;margin: 10px 0px">${otp}</span>` +
            '<p>It is valid for a short period of time, make sure to validate it quickly.</p></div></div>',
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Verification Code',
      },
    },
    Source: process.env.NOREPLY_EMAIL_ADDRESS,
  });

  if (httpStatusCode !== 200) {
    return failure(500, 'Failed to send email. Please try again later.');
  }

  const expiresAt = new Date(expires);

  const dynamodb = new DynamoDB({
    endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
  });
  await dynamodb.putItem({
    TableName: TOTP_TABLE_NAME,
    Item: marshall({
      email,
      otp,
      expiresAt: expiresAt.toISOString(),
    }),
  });
  return success(204);
};

export { sendOtp };
