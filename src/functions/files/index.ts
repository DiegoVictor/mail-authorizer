import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: '/files',
      },
    },
    {
      http: {
        method: 'post',
        path: '/files',
        authorizer: 'authorizer',
      },
    },
  ],
};
