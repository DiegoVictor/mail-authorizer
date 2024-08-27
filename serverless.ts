import type { AWS } from '@serverless/typescript';

import auth from '@functions/auth';
import { secret } from '@libs/generate';
import { FILES_TABLE_NAME, TOTP_TABLE_NAME } from '@libs/constants';

const serverlessConfiguration: AWS = {
  service: 'mailauthorizer',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      JWT_SECRET: secret(),
      NOREPLY_EMAIL_ADDRESS: 'no-reply@mailauthorizer.com',
      CONTENT_BUCKET: {
        Ref: 'ContentBucket',
      },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:PutItem',
              'dynamodb:GetItem',
              'dynamodb:DeleteItem',
              'secretsmanager:GetSecretValue',
              'ses:SendEmail',
            ],
            Resource: '*',
          },
        ],
      },
    },
  },
  functions: {
    auth,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      ContentBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'mailauthorizer-content',
        },
      },
      ContentBucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          Bucket: {
            Ref: 'ContentBucket',
          },
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  AWS: {
                    'Fn::Join': [
                      '',
                      [
                        'arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ',
                        { Ref: 'CloudFrontOriginAccessIdentity' },
                      ],
                    ],
                  },
                },
                Action: 's3:GetObject',
                Resource: {
                  'Fn::Join': [
                    '',
                    [
                      {
                        'Fn::GetAtt': ['ContentBucket', 'Arn'],
                      },
                      '/*',
                    ],
                  ],
                },
              },
            ],
          },
        },
      },
      FilesDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: FILES_TABLE_NAME,
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            {
              AttributeName: 'createdAt',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'createdAt',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
      TotpDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: TOTP_TABLE_NAME,
          AttributeDefinitions: [
            {
              AttributeName: 'email',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'email',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
