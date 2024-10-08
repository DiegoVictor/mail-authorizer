import type { AWS } from '@serverless/typescript';

import auth from '@functions/auth';
import getSignedUrl from '@functions/files/get-signed-url';
import authorizer from '@functions/authorizer';
import files from '@functions/files';
import { postProcessing } from '@functions/index';
import { FILES_TABLE_NAME } from '@infra/repositories/files';
import { TOTP_TABLE_NAME } from '@infra/repositories/totp';

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
      JWT_SECRET: '${env:JWT_SECRET, ""}',
      NOREPLY_EMAIL_ADDRESS:
        '${env:NOREPLY_EMAIL_ADDRESS, "diegovictorgonzaga@gmail.com"}',
      CONTENT_BUCKET: '${self:custom.bucketName}',
      CLOUDFRONT_KEY_PAIR_ID: {
        Ref: 'CloudFrontPublicKey',
      },
      TOTP_KEY: '${env:TOTP_KEY, ""}',
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
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:DeleteItem',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:Query',
              's3:GetObject',
              's3:PutObject',
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
          Bucket: '${self:custom.bucketName}',
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
      FilesDynamoDbTable: {
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
                {
                  AttributeName: 'createdAt',
                  KeyType: 'RANGE',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
      TotpDynamoDbTable: {
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
