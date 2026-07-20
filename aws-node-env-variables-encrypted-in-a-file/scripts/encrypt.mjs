#!/usr/bin/env node
// Encrypts secrets.<stage>.yml with a KMS key and writes
// secrets.<stage>.yml.encrypted (safe to commit).
//
// Usage:
//   KMS_KEY_ID=<key-id-or-alias-or-arn> npm run encrypt -- dev
import { readFileSync, writeFileSync } from 'node:fs';
import { KMSClient, EncryptCommand } from '@aws-sdk/client-kms';
import YAML from 'yaml';

const stage = process.argv[2] || process.env.STAGE || 'dev';
const keyId = process.env.KMS_KEY_ID;

if (!keyId) {
  console.error(
    'Set KMS_KEY_ID to the key id/alias/ARN from the `SecretsKeyId` stack output (run `serverless deploy` first).',
  );
  process.exit(1);
}

const plainPath = `secrets.${stage}.yml`;
const encryptedPath = `${plainPath}.encrypted`;

const plaintext = readFileSync(plainPath, 'utf8');
YAML.parse(plaintext); // fail fast if the file isn't valid YAML

const kms = new KMSClient({});
const { CiphertextBlob } = await kms.send(
  new EncryptCommand({ KeyId: keyId, Plaintext: Buffer.from(plaintext, 'utf8') }),
);

writeFileSync(encryptedPath, Buffer.from(CiphertextBlob).toString('base64'));
console.log(`Successfully encrypted '${plainPath}' to '${encryptedPath}'`);
