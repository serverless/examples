<!--
title: AWS Storing Encrypted Secrets example in NodeJS
description: This example demonstrates how to store secrets like API keys encrypted in your repository while providing them as environment variables to your AWS Lambda functions.
layout: Doc
-->
# Serverless

IMPORTANT NOTE: As pointed out in the [AWS documentation](http://docs.aws.amazon.com/lambda/latest/dg/env_variables.html) for storing sensible the `Ciphertext` should be stored in the environment variables. This tutorial doesn't go into that yet, but we will update it soon accordingly.

This example demonstrates how to store secrets like API keys encrypted in your repository while providing them as environment variables to your AWS Lambda functions.

## Use-cases

- Provide secrets like API keys to your Lambda functions

## Why?

While repository hosting services like Github or Bitbucket have very high security standards it's recommended to not store your unencrypted secrets there. In addition in larger teams not everybody needs to have access to those secrets of your production environment.

Encrypting your secrets per stage and only adding the encrypted files into your repository is a sensible strategy to fulfill the previously described goals. The passwords to decrypt and encrypt the secrets files should only be shared between the necessary developers over a secure channel. In case you are using a Continuous Integration to deploy your infrastructure obviously this system must be aware of the passwords as well.

## Setup

Since this plugin uses the Serverless plugin `serverless-secrets-plugin` you need to setup the `node_modules` by running:

```bash
npm install
```

## Usage

### Decrypt and Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy --stage dev
```

The expected result should be similar to:

```bash
 Error --------------------------------------------------

    Couldn't find the secrets file for this stage: secrets.dev.yml

    For debugging logs, run again after setting SLS_DEBUG env var.

 Get Support --------------------------------------------
    Docs:          docs.serverless.com
    Bugs:          github.com/serverless/serverless/issues

    Please report this error. We think it might be a bug.

 Your Environment Information -----------------------------
    OS:                 darwin
    Node Version:       6.2.2
    Serverless Version: 1.2.0
```

This is happening since the `serverless-secrets-plugin` makes sure a secrets file for the specific stage exists.

Let's decrypt the secrets file so you can deploy the service. To do so run

```bash
serverless decrypt --stage dev --password 'va$27dC}9382G7ac6?V'
```

The expected result should be similar to:

```bash
Serverless: Sucessfully encrypted 'secrets.dev.yml.encrypted' to 'secrets.dev.yml'
```

Now that you have the unencrypted version of your secrets file this directory you can deploy with

```bash
serverless deploy --stage dev
```

### Encrypt

In case you want to add, update or remove entries in your secrets file simply modify your secrets file. Once you are done encrypt it with

```bash
serverless encrypt --stage dev --password 'va$27dC}9382G7ac6?V'
```

The expected result should be:

```bash
Serverless: Sucessfully encrypted 'secrets.dev.yml' to 'secrets.dev.yml.encrypted'
```

The encrypted file can be checked into your version control system e.g. Git.

### Decrypt and Encrypt the Production Secrets

```bash
serverless decrypt --stage prod --password 'v2]83WDneGt9AGXv]X6QfP9NW3^J&K3V'
```

```bash
serverless encrypt --stage prod --password 'v2]83WDneGt9AGXv]X6QfP9NW3^J&K3V'
```

# Important Note

Make sure the the unencrypted secrets files are listed in .gitignore or similar to make sure they are never checked into your repository.
