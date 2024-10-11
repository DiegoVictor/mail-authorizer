# Mail Authorizer
[![AppVeyor](https://img.shields.io/appveyor/build/diegovictor/mail-authorizer?logo=appveyor&style=flat-square)](https://ci.appveyor.com/project/DiegoVictor/mail-authorizer)
[![serverless](https://img.shields.io/badge/serverless-3.39.0-FD5750?style=flat-square&logo=serverless)](https://www.serverless.com/)
[![typescript](https://img.shields.io/badge/typescript-4.9.5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![babel](https://img.shields.io/badge/babel-7.25.2-F9DC3E?style=flat-square&logo=babel)](https://babeljs.io/)
[![jest](https://img.shields.io/badge/jest-29.7.0-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/mail-authorizer?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/mail-authorizer)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://raw.githubusercontent.com/DiegoVictor/mail-authorizer/refs/heads/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

It allows users to authenticate using email address and an OTP code sent through email message and once authenticated you can download files content and upload new files. It also has a trigger for new uploaded files that adds the file to AWS DynamoDB and make it is listed in the endpoints. CloudFront was used to caching files.

![Infrastructure Diagram](https://raw.githubusercontent.com/DiegoVictor/mail-authorizer/refs/heads/main/MailAuthorizer.drawio.png)

## Table of Contents
* [Requirements](#requirements)
* [Install](#install)
  * [.env](#env)
* [Usage](#usage)
  * [Routes](#routes)
    * [Requests](#requests)
* [Deploy](#deploy)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

# Requirements
* Node.js ^20.16.0
* Serveless Framework
* AWS Account
  * [S3](https://aws.amazon.com/s3)
  * [Lambda](https://aws.amazon.com/lambda)
  * [API Gateway](https://aws.amazon.com/api-gateway)
  * [DynamoDB](https://aws.amazon.com/dynamodb)
  * [SES](https://aws.amazon.com/pt/ses)
  * [CloudFront](https://aws.amazon.com/pt/cloudfront)
  * [Secrets Manager](https://aws.amazon.com/pt/secrets-manager)

# Install
```
npm install
```
Or:
```
yarn
```

## .env
Rename the `.env.example` in the root directory to `.env` then update it with your settings.

|key|description
|---|---
|TOTP_KEY|An alphanumeric random string. Seed used to generate OTP codes.
|JWT_SECRET|An alphanumeric random string. Used to create signed tokens.
|NOREPLY_EMAIL_ADDRESS|Email address used to send the OTP code email message.
|REGION|AWS Region.

# Usage
First we need to spin up localstack container and create the needed resources using `localstack.sh` script:
```shell
docker-compose up -d
docker-compose exec -it localstack sh -c "/var/lib/localstack/scripts/localstack.sh"
```
> Or you can access the container and run `sh /var/lib/localstack/scripts/localstack.sh`

Now start the server:
```shell
yarn dev:server
```
Or:
```shell
npm run dev:server
```

## Routes
|route|HTTP Method|params|description|authentication
|:---|:---:|:---:|:---:|:---:
|`/files`|GET|`cursorId` query parameter.|List files.| -
|`/file/:id/signed-url`|GET|`id` of a file.|Generate a signed URL to download file content.|Required
|`/files`|POST|Body with `title` and `filename`.|Generate presigned URL to upload file.|Required
|`/auth`|POST|Body with `email`.|Send OTP code to the provided email address.| -
|`/auth`|POST|Body with `email` and `otp`.|Authenticate user and generate JWT token.| -

### Requests

* `POST /files`

Request body:
```json
{
    "title": "Lorem Ipsum",
    "filename": "sample.mp4"
}
```

* `POST /auth`

Request body:
```json
{
    "email": "johndoe@example.com"
}
```

```json
{
    "email": "johndoe@example.com",
    "otp": "111065"
}
```

# Deploy
First you will need to generate public and private keys for CloudFront Distribution:

```shell
openssl genpkey -algorithm RSA -out private_key.pem -aes256
openssl rsa -pubout -in private_key.pem -out public_key.pem
```
> Once the files exist they will be included into the package by `serverless.ts` configuration file.

Now you are ready to deploy:
```shell
sls deploy
```

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```
> Run the command in the root folder

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
