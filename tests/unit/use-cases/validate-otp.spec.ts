import { faker } from '@faker-js/faker';
import { validateOtp } from '../../../src/use-cases/validate-otp';

const mockGetByEmail = jest.fn();
const mockDeleteByEmail = jest.fn();
jest.mock('@infra/repositories/totp', () => {
  return {
    getOneByEmail: (email: string) => mockGetByEmail(email),
    deleteByEmail: (email: string) => mockDeleteByEmail(email),
  };
});

describe('validateOTP', () => {
  it('should validate OTP code', async () => {
    const email = faker.internet.email();
    const otp = faker.string.alphanumeric(6);

    const totp = {
      email,
      otp,
      expiresAt: faker.date.future({ years: 1 }).getTime(),
    };
    mockGetByEmail.mockResolvedValue(totp);

    await validateOtp(email, otp);

    expect(mockGetByEmail).toHaveBeenCalledWith(email);
    expect(mockDeleteByEmail).toHaveBeenCalledWith(email);
  });

  it('should not validate OTP code when it is expired', async () => {
    const email = faker.internet.email();
    const otp = faker.string.alphanumeric(6);

    const totp = {
      email,
      otp,
      expiresAt: faker.date.recent().getTime(),
    };
    mockGetByEmail.mockResolvedValue(totp);

    const response = await validateOtp(email, otp);

    expect(mockGetByEmail).toHaveBeenCalledWith(email);
    expect(mockDeleteByEmail).not.toHaveBeenCalled();
    expect(response).toEqual({
      httpCode: 400,
      response: {
        message: 'Code expired',
      },
    });
  });

  it('should not validate OTP code when it is different from the stored one', async () => {
    const email = faker.internet.email();
    const otp = faker.string.alphanumeric(6);

    const totp = {
      email,
      otp: faker.string.alphanumeric(6),
      expiresAt: faker.date.recent().getTime(),
    };
    mockGetByEmail.mockResolvedValue(totp);

    const response = await validateOtp(email, otp);

    expect(mockGetByEmail).toHaveBeenCalledWith(email);
    expect(mockDeleteByEmail).not.toHaveBeenCalled();
    expect(response).toEqual({
      httpCode: 400,
      response: {
        message: 'Invalid code',
      },
    });
  });

  it('should not validate OTP code when user did not request it previously', async () => {
    const email = faker.internet.email();
    const otp = faker.string.alphanumeric(6);

    mockGetByEmail.mockResolvedValue(undefined);

    const response = await validateOtp(email, otp);

    expect(mockGetByEmail).toHaveBeenCalledWith(email);
    expect(mockDeleteByEmail).not.toHaveBeenCalled();
    expect(response).toEqual({
      httpCode: 400,
      response: {
        message: 'Invalid code',
      },
    });
  });
});
