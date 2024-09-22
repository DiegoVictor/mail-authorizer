import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { SES } from '@aws-sdk/client-ses';
import { marshall } from '@aws-sdk/util-dynamodb';
import { TOTP } from 'totp-generator';
import { failure } from '@libs/failure';
import { success } from '@libs/success';
import { TOTP_TABLE_NAME } from '@libs/constants';
import { sendEmail } from '@infra/services/ses';

const sendOtp = async (email: string) => {
  const timestamp = Date.now() + 30 * 1000;
  const { expires, otp } = TOTP.generate(process.env.TOTP_KEY, {
    period: 5 * 60,
    timestamp,
  });

  await sendEmail(
    email,
    `<div style="font-family: Roboto, sans-serif;padding: 15px 15px">
      <div>
        <p>Hi,</p><br />
        <p>Here is your validation code:</p>
        <span style="display:inline-block;font-size: 32px;font-weight: bold;margin: 10px 0px">${otp}</span>
        <p>It is valid for a short period of time, make sure to validate it quickly.</p>
      </div>
    </div>`
  );

  const expiresAt = new Date(expires);
  await save({
    email,
    otp,
    expiresAt: expiresAt.toISOString(),
  });

  return success(204);
};

export { sendOtp };
