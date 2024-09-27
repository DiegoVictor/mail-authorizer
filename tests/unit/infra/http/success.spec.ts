import { success } from '../../../../src/infra/http/success';

describe('Success', () => {
  it('should return a HTTP 204', () => {
    const response = success(204);

    expect(response.isSuccess()).toBe(true);
    expect(response).toEqual({ httpCode: 204 });
  });

  it('should return a HTTP 200 with response', () => {
    const response = success(200, {
      message: 'Success',
    });

    expect(response.isSuccess()).toBe(true);
    expect(response).toEqual({
      httpCode: 200,
      response: {
        message: 'Success',
      },
    });
  });
});
