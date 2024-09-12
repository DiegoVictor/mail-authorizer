import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: '${self:provider.environment.CONTENT_BUCKET}',
        event: 's3:ObjectCreated:*',
        rules: [
          {
            prefix: 'files/',
          },
        ],
      },
    },
  ],
};
