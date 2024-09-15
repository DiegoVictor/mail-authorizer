import { sign } from 'jsonwebtoken';

const createToken = (email: string) =>
  sign({ email }, String(process.env.JWT_SECRET), {
    expiresIn: '1h',
  });

export { createToken };
