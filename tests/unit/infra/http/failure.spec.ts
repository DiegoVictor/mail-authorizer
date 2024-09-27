import { failure } from '../../../../src/infra/http/failure';

describe('Failure', () => {
  it('should return a HTTP 400', () => {
    const response = failure(400, 'Bad Request');

    expect(response.isSuccess()).toBe(false);
    expect(response).toEqual({
      httpCode: 400,
      response: { message: 'Bad Request' },
    });
  });
});
