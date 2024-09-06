import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    CLOUDFRONT_KEY_PAIR_ID: {
      Ref: 'CloudFrontPublicKey',
    },
    CLOUDFRONT_DOMAIN: {
      'Fn::Join': [
        '',
        [
          'https://',
          { 'Fn::GetAtt': ['CloudFrontDistribution', 'DomainName'] },
        ],
      ],
    },
  },
  events: [
    {
      http: {
        method: 'get',
        path: '/files/{id}/signed-url',
        authorizer: 'authorizer',
      },
    },
  ],
};
