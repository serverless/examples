<!--
title: 'OpenWhisk Serverless Boilerplate example in Rust'
description: 'This example shows a Serverless boilerplate in Rust.'
layout: Doc
framework: v1+
platform: OpenWhisk
language: Rust
authorLink: 'https://github.com/jonee'
authorName: 'Jonee Ryan Ty'
authorAvatar:
-->

# Serverless Boilerplate - OpenWhisk - Rust

(This example is largely based on the openwhisk-go-simple by James Thomas but adapted for Rust)

Make sure `serverless` is installed. [See installation guide](https://serverless.com/framework/docs/providers/openwhisk/guide/installation/).

You will also need to set up your OpenWhisk account credentials using environment variables or a configuration file. Please see the [this guide for more information](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).

## 1. Install Project Dependencies
`npm install` in this directory to download the modules from `package.json`.

## 2. Compile Rust Binary (Statically)

```
$ cargo build --release --target x86_64-unknown-linux-musl
```

## 3. Deploy
`serverless deploy` or `sls deploy`. `sls` is shorthand for the Serverless CLI command

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Compiling Functions...
Serverless: Compiling Packages...
Serverless: Compiling API Gateway definitions...
Serverless: Compiling Rules...
Serverless: Compiling Triggers & Feeds...
Serverless: Compiling Service Bindings...
Serverless: Deploying Functions...
Serverless: Deploying API Gateway definitions...
Serverless: Deployment successful!


Service Information
platform:	us-south.functions.cloud.ibm.com
namespace:	_
service:	rust-service

actions:
rust-service-dev-test_test
```

## 4. Invoke deployed function
`serverless invoke --function test_test` or `serverless invoke -f test_test`

`-f` is shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```bash
$ serverless invoke -f test_test
{
    "message": "Serverless Rust Hello"
}

```

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).**
