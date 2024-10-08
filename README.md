# Mail Authorizer
[![AppVeyor](https://img.shields.io/appveyor/build/diegovictor/mail-authorizer?logo=appveyor&style=flat-square)](https://ci.appveyor.com/project/DiegoVictor/mail-authorizer)
[![serverless](https://img.shields.io/badge/serverless-3.39.0-FD5750?style=flat-square&logo=serverless)](https://www.serverless.com/)
[![typescript](https://img.shields.io/badge/typescript-4.9.5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![babel](https://img.shields.io/badge/babel-7.25.2-F9DC3E?style=flat-square&logo=babel)](https://babeljs.io/)
[![jest](https://img.shields.io/badge/jest-29.7.0-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/mail-authorizer?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/mail-authorizer)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://raw.githubusercontent.com/DiegoVictor/mail-authorizer/main/LICENSE)
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

