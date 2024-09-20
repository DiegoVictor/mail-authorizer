import type { AWS } from '@serverless/typescript';

import auth from '@functions/auth';
import getSignedUrl from '@functions/files/get-signed-url';
import authorizer from '@functions/authorizer';
import files from '@functions/files';
import { secret } from '@libs/generate';
import { FILES_TABLE_NAME, TOTP_TABLE_NAME } from '@libs/constants';
import { postProcessing } from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'mailauthorizer',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
    'serverless-dotenv-plugin',
  ],
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
      NOREPLY_EMAIL_ADDRESS: "no-reply@mailauthorizer.com",
      CONTENT_BUCKET: '${self:custom.bucketName}',
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
    authorizer,
    getSignedUrl,
    files,
    postProcessing,
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
    bucketName: 'mailauthorizer-content',
  },
  resources: {
    Resources: {
      ContentBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.bucketName}',
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
      CloudFrontPrivateKeySecret: {
        Type: 'AWS::SecretsManager::Secret',
        Properties: {
          Name: 'mailauthorizer-cloudfront-private-key',
          Description: 'Private key for CloudFront Distribution',
          SecretString: '${file(./private_key.pem)}',
        },
      },
      CloudFrontPublicKey: {
        Type: 'AWS::CloudFront::PublicKey',
        Properties: {
          PublicKeyConfig: {
            Name: 'mailauthorizer-cloudfront-public-key',
            CallerReference: 'mailauthorizer-cloudfront-public-key',
            EncodedKey: '${file(./public_key.pem)}',
          },
        },
      },
      CloudFrontKeyGroup: {
        Type: 'AWS::CloudFront::KeyGroup',
        Properties: {
          KeyGroupConfig: {
            Items: [
              {
                Ref: 'CloudFrontPublicKey',
              },
            ],
            Name: 'mailauthorizer-cloudfront-key-group',
          },
        },
      },
      CloudFrontOriginAccessIdentity: {
        Type: 'AWS::CloudFront::CloudFrontOriginAccessIdentity',
        Properties: {
          CloudFrontOriginAccessIdentityConfig: {
            Comment: {
              Ref: 'AWS::StackName',
            },
          },
        },
      },
      CloudFrontDistribution: {
        Type: 'AWS::CloudFront::Distribution',
        Properties: {
          DistributionConfig: {
            DefaultCacheBehavior: {
              AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
              ForwardedValues: {
                Cookies: {
                  Forward: 'none',
                },
                QueryString: false,
              },
              TargetOriginId: 'public-content',
              ViewerProtocolPolicy: 'redirect-to-https',
              TrustedKeyGroups: [
                {
                  Ref: 'CloudFrontKeyGroup',
                },
              ],
            },
            Enabled: true,
            Origins: [
              {
                DomainName: {
                  'Fn::GetAtt': ['ContentBucket', 'DomainName'],
                },
                Id: 'public-content',
                S3OriginConfig: {
                  OriginAccessIdentity: {
                    'Fn::Join': [
                      '',
                      [
                        'origin-access-identity/cloudfront/',
                        { Ref: 'CloudFrontOriginAccessIdentity' },
                      ],
                    ],
                  },
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
              AttributeName: 'type',
              AttributeType: 'S',
            },
            {
              AttributeName: 'createdAt',
              AttributeType: 'N',
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
          GlobalSecondaryIndexes: [
            {
              IndexName: 'TypeIndex',
              KeySchema: [
                {
                  AttributeName: 'type',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
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
