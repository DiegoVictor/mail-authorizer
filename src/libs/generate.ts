import { randomBytes, randomInt } from 'crypto';
export const totp = (size = 8) =>
  randomBytes(size)
    .toString('hex')
    .toUpperCase()
    .replace(/[0-18-9]/g, () => randomInt(2, 7).toString());
