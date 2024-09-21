import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    TOTP_KEY: '${env:TOTP_KEY}',
  },
  events: [
    {
      http: {
        method: 'post',
        path: 'auth',
      },
    },
  ],
};
