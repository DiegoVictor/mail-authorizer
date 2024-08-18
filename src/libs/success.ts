class Success {
  public readonly httpCode: number;
  public readonly response?: any;

  constructor(httpCode: number, response?: string) {
    this.httpCode = httpCode;
    if (response) {
      this.response = response;
    }
  }

  isSuccess() {
    return true;
  }
}

export const success = (httpCode = 200, response?: any) =>
  new Success(httpCode, response);
