import { TOTP } from 'totp-generator';

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
};

export { sendOtp };
