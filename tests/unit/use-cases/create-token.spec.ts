import { faker } from '@faker-js/faker';
import { verify } from 'jsonwebtoken';
import { createToken } from '../../../src/use-cases/create-token';

describe('createToken', () => {
  it('should be able to create a JWT token', () => {
    const email = faker.internet.email();
    const token = createToken(email);

    const decoded = verify(token, String(process.env.JWT_SECRET));
    expect(decoded).toHaveProperty('email', email);
  });
});
