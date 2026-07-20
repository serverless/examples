<!--
title: 'AWS Serverless Boilerplate example in Rust'
description: 'This example shows a Serverless boilerplate in Rust.'
layout: Doc
framework: v4
platform: AWS
language: Rust
priority: 10
authorLink: 'https://github.com/jonee'
authorName: 'Jonee Ryan Ty'
authorAvatar: 'https://avatars.githubusercontent.com/u/1385276?v=4&s=140'
-->

# Serverless Boilerplate - AWS - Rust

Make sure `serverless` is installed. [See installation guide](https://serverless.com/framework/docs/providers/AWS/guide/installation/).

You will also need to set up your AWS account credentials using environment variables or a configuration file. Please see the [this guide for more information](https://serverless.com/framework/docs/providers/AWS/guide/credentials/).

The function runs on the `provided.al2023` (arm64) custom runtime, built with
[cargo-lambda](https://www.cargo-lambda.info/).

## 1. Install cargo-lambda

```bash
cargo install cargo-lambda --locked
```

## 2. Build

```bash
cargo lambda build --release --arm64
```

or simply:

```bash
make build
```

This compiles the `hello` binary to `target/lambda/hello/bootstrap` and zips it to `bin/hello.zip`,
the artifact referenced by `serverless.yml`.

## 3. Deploy

```bash
serverless deploy
```

or:

```bash
make deploy
```

## 4. Invoke deployed function

```bash
$ curl https://***.execute-api.us-east-1.amazonaws.com/test/test
{"message":"Serverless Rust Hello"}
```
