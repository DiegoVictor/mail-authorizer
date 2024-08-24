import { sign } from 'jsonwebtoken';

const createToken = (email: string) =>
  sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

export { createToken };
