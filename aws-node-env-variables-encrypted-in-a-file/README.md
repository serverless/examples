<!--
title: 'AWS Storing Encrypted Secrets example in NodeJS'
description: 'This example demonstrates how to store secrets like API keys encrypted in your repository while providing them as environment variables to your AWS Lambda functions.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/rupakg'
authorName: 'Rupak Ganguly'
authorAvatar: 'https://avatars0.githubusercontent.com/u/8188?v=4&s=140'
-->
# Serverless - Encrypted Secrets in a File

This example demonstrates how to store secrets like API keys encrypted in your repository, decrypting them with [AWS KMS](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html) at runtime inside the Lambda function.

## Use-cases

- Provide secrets like API keys to your Lambda functions without ever committing plaintext to source control

## Why?

While repository hosting services like Github or Bitbucket have very high security standards it's recommended to not store your unencrypted secrets there. In addition in larger teams not everybody needs to have access to those secrets of your production environment.

Encrypting your secrets per stage with a KMS key and only adding the encrypted files to your repository is a sensible strategy to fulfill the previously described goals. Only principals granted `kms:Decrypt` on the key (in this example, the Lambda function's execution role) can read the secrets back.

## How it works

* `serverless.yml` provisions a customer-managed KMS key (`SecretsKey`) and grants the `resetPassword` function's execution role `kms:Decrypt` on it.
* `secrets.<stage>.yml` holds your plaintext secrets locally. It's gitignored - never commit it.
* `npm run encrypt -- <stage>` encrypts `secrets.<stage>.yml` with the KMS key into `secrets.<stage>.yml.encrypted`, which is safe to commit.
* `npm run decrypt -- <stage>` reverses that, for local editing.
* At runtime, `handler.js` reads the packaged `secrets.<stage>.yml.encrypted` file, calls `KMSClient`'s `DecryptCommand`, and caches the decrypted values for the lifetime of the execution environment (warm invocations skip the KMS round trip).

## Setup

```bash
npm install
```

Copy `secrets.example.yml` to `secrets.dev.yml` and fill in real values:

```bash
cp secrets.example.yml secrets.dev.yml
```

```yaml
SESSION_KEY: 'your-session-signing-key-here'
EMAIL_SERVICE_API_KEY: 'your-email-service-api-key-here'
```

## Usage

### 1. Deploy the KMS key

```bash
serverless deploy
```

Grab the key id/alias from the `SecretsKeyId` stack output (or run `serverless info`).

### 2. Encrypt your secrets file

```bash
KMS_KEY_ID=<key-id-from-stack-output> npm run encrypt -- dev
```

```bash
Successfully encrypted 'secrets.dev.yml' to 'secrets.dev.yml.encrypted'
```

Commit `secrets.dev.yml.encrypted` - it can safely be checked into version control.

### 3. Deploy again so the encrypted file is packaged with the function

```bash
serverless deploy
```

### 4. Invoke it

```bash
serverless invoke -f resetPassword --log
```

```bash
{
    "statusCode": 200,
    "body": "{\"message\":\"Password sent.\"}"
}
--------------------------------------------------------------------
SESSION_KEY:  your-session-signing-key-here
EMAIL_SERVICE_API_KEY:  your-email-service-api-key-here
```

### Updating a secret

Edit `secrets.dev.yml`, then re-run:

```bash
KMS_KEY_ID=<key-id-from-stack-output> npm run encrypt -- dev
```

```bash
Successfully encrypted 'secrets.dev.yml' to 'secrets.dev.yml.encrypted'
```

### Recovering the plaintext file

If you've lost your local `secrets.dev.yml`, decrypt it back from the committed `.encrypted` file:

```bash
STAGE=dev npm run decrypt -- dev
```

```bash
Successfully decrypted 'secrets.dev.yml.encrypted' to 'secrets.dev.yml'
```

### Production secrets

The same commands work for any stage - just swap `dev` for `prod`:

```bash
serverless deploy --stage prod
KMS_KEY_ID=<prod-key-id-from-stack-output> npm run encrypt -- prod
```

# Important Note

Make sure the unencrypted `secrets.*.yml` files are listed in `.gitignore` (they already are here) so they're never checked into your repository - only the `.encrypted` files should be committed.
