import { failure } from '@libs/failure';
import { success } from '@libs/success';
import { deleteByEmail, getOneByEmail } from '@infra/repositories/totp';

const validateOtp = async (email: string, otp: string) => {
  const totp = await getOneByEmail(email);

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
