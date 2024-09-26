import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const secretsManager = new SecretsManager({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
});

export const getSecret = async (SecretId: string) => {
  const { SecretString } = await secretsManager.getSecretValue({
    SecretId,
  });

  return SecretString;
};
