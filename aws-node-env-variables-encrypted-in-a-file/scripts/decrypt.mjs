#!/usr/bin/env node
// Decrypts secrets.<stage>.yml.encrypted back into secrets.<stage>.yml for
// local editing. The plaintext file is gitignored - never commit it.
//
// Usage:
//   npm run decrypt -- dev
import { readFileSync, writeFileSync } from 'node:fs';
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

const stage = process.argv[2] || process.env.STAGE || 'dev';
const encryptedPath = `secrets.${stage}.yml.encrypted`;
const plainPath = `secrets.${stage}.yml`;

const ciphertext = readFileSync(encryptedPath, 'utf8').trim();

const kms = new KMSClient({});
const { Plaintext } = await kms.send(
  new DecryptCommand({ CiphertextBlob: Buffer.from(ciphertext, 'base64') }),
);

writeFileSync(plainPath, Buffer.from(Plaintext));
console.log(`Successfully decrypted '${encryptedPath}' to '${plainPath}'`);
