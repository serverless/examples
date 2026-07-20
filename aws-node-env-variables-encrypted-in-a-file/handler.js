import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kms = new KMSClient({});

// Decrypt once per cold start and cache the result across warm invocations.
let secretsPromise;

function loadSecrets() {
  if (!secretsPromise) {
    secretsPromise = (async () => {
      const stage = process.env.STAGE ?? 'dev';
      const encryptedPath = path.join(__dirname, `secrets.${stage}.yml.encrypted`);
      const ciphertext = readFileSync(encryptedPath, 'utf8').trim();

      const { Plaintext } = await kms.send(
        new DecryptCommand({ CiphertextBlob: Buffer.from(ciphertext, 'base64') }),
      );

      return YAML.parse(Buffer.from(Plaintext).toString('utf8'));
    })();
  }
  return secretsPromise;
}

export const resetPassword = async () => {
  const secrets = await loadSecrets();

  console.log('SESSION_KEY: ', secrets.SESSION_KEY);

  // Authenticate the user session

  console.log('EMAIL_SERVICE_API_KEY: ', secrets.EMAIL_SERVICE_API_KEY);

  // The email service api key would be used to send a reset password email.

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Password sent.',
    }),
  };
};
