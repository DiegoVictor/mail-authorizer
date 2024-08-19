import { TOTP } from 'totp-generator';

const sendOtp = async (email: string) => {
  const timestamp = Date.now() + 30 * 1000;
  const { expires, otp } = TOTP.generate(process.env.TOTP_KEY, {
    period: 5 * 60,
    timestamp,
  });
};

export { sendOtp };
