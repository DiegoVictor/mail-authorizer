import { SES } from '@aws-sdk/client-ses';

const ses = new SES();

export const sendEmail = async (email: string, Data: string) =>
  ses.sendEmail({
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Verification Code',
      },
    },
    Source: process.env.NOREPLY_EMAIL_ADDRESS,
  });
