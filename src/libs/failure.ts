class Failure {
  public readonly httpCode: number;
  public readonly response: {
    message: string;
  };

  constructor(httpCode: number, message: string) {
    this.httpCode = httpCode;
    this.response = {
      message,
    };
  }

  isSuccess() {
    return false;
  }
}

export const failure = (httpCode: number, message: string) =>
  new Failure(httpCode, message);
