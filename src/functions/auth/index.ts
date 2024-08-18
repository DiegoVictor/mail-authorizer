import { totp } from '@libs/generate';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    TOTP_KEY: totp(),
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
