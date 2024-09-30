import { faker } from '@faker-js/faker';
import { randomBytes, randomInt } from 'node:crypto';
import { sendOtp } from '../../../src/use-cases/send-otp';

const mockSave = jest.fn();
jest.mock('@infra/repositories/totp', () => {
  return {
    save: (record: Record<string, any>) => mockSave(record),
  };
});

const mockSendEmail = jest.fn();
jest.mock('@infra/services/ses', () => {
  return {
    sendEmail: (email: string, otp: string) => mockSendEmail(email, otp),
  };
});

const totp = () =>
  randomBytes(8)
    .toString('hex')
    .toUpperCase()
    .replace(/[0-18-9]/g, () => randomInt(2, 7).toString());

const OLD_ENV = process.env;

describe('sendOTP', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = OLD_ENV;
  });

  it('should send OTP code', async () => {
    const email = faker.internet.email();

    process.env.TOTP_KEY = totp();
    await sendOtp(email);

    expect(mockSendEmail).toHaveBeenCalledWith(email, expect.any(String));
    expect(mockSave).toHaveBeenCalledWith({
      email,
      otp: expect.any(String),
      expiresAt: expect.any(String),
    });
  });
});
