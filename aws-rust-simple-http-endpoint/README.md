<!--
title: 'AWS Serverless Boilerplate example in Rust'
description: 'This example shows a Serverless boilerplate in Rust.'
layout: Doc
framework: v1+
platform: AWS
language: Rust
authorLink: 'https://github.com/jonee'
authorName: 'Jonee Ryan Ty'
authorAvatar:
-->

# Serverless Boilerplate - AWS - Rust

Make sure `serverless` is installed. [See installation guide](https://serverless.com/framework/docs/providers/AWS/guide/installation/).

You will also need to set up your AWS account credentials using environment variables or a configuration file. Please see the [this guide for more information](https://serverless.com/framework/docs/providers/AWS/guide/credentials/).

## 1. Install Project Dependencies
`npm install` in this directory to download the modules from `package.json`.

## 2. Compile Rust Binary

```
$ cargo build --release
```

## 3. Deploy

Hackish way to deploy

1. Run `sls deploy` which would give an error about missing file path in the package path. 
2. If you look at .serverless it should have 3 files- 

cloudformation-template-create-stack.json
cloudformation-template-update-stack.json
serverless-state.json

3. rename .serverless folder to p
4. cargo build --release then add aws-rust-simple-http-endpoint.zip which consists of target/release/test only to the p folder
5. sls deploy --package p




## 4. Invoke deployed function

```bash
$ curl https://***.execute-api.us-east-1.amazonaws.com/dev/test/test
{"message":"Serverless Rust Hello"}
```

**For more information on the Serverless AWS plugin, please see the project repository: [https://serverless.com/framework/docs/providers/AWS/guide/credentials/](https://serverless.com/framework/docs/providers/AWS/guide/credentials/).**
