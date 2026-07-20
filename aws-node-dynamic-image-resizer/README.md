<!--
title: 'Dynamic Image Resizing API'
description: 'This example shows you how to setup a dynamic image resizer API'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/sebito91'
authorName: 'Sebastian Borza'
authorAvatar: 'https://avatars0.githubusercontent.com/u/3159454?v=4&s=140'
-->

# Dynamic image resizing with Node.js and Serverless framework

In this example, we set up a dynamic image resizing solution with AWS S3 and a Serverless framework function written in Node.js. We use [the `sharp` package](https://www.npmjs.com/package/sharp) for image resizing.

## Pre-requisites

In order to deploy the function, you will need the following:

- API credentials for AWS, with Administrator permissions (for simplicity, not recommended in production).
- An S3 bucket in your AWS account. By default this deploys against `image-resizing-<stage>-<account-id>` (see `custom.defaultBucket` in `serverless.yml`); set the `BUCKET` environment variable to point at a bucket of your own choosing instead.
- Node.js 24 and npm installed locally.

## Native dependency caveat (`sharp`)

`sharp` ships prebuilt native binaries per OS/CPU. This example deploys to `nodejs24.x` on `arm64` (per `provider.architecture`). If you install dependencies on a different OS/architecture (e.g. an Intel/AMD Mac or Windows), npm will fetch the binary for your local machine, not for Lambda's `linux-arm64` target, and `serverless package`/`deploy` will ship a `sharp` build that fails at runtime.

Before deploying from a non-Linux-arm64 machine, install the correct binary explicitly:

```bash
npm install --os=linux --cpu=arm64 --libc=glibc
```

(Swap `--cpu=arm64` for `--cpu=x64` if you change `provider.architecture` to `x86_64`.) Alternatively, run `npm install` inside a `linux/arm64` Docker container or install via a CI runner that matches Lambda's target platform.

## Deploying the Serverless project

1. Install the dependencies:

```bash
npm install
```

2. Deploy the Serverless project:

```bash
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "image-resizing" to stage "dev" (us-east-1)

✔ Service deployed to stack image-resizing-dev (52s)

endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{size}/{image}
functions:
  resize: image-resizing-dev-resize (2.4 MB)
```

## Setting up the S3 bucket

Make sure that your S3 bucket (either the default `image-resizing-<stage>-<account-id>` or the one you supplied via `BUCKET`) is public. Then follow these additional setup steps:

1. Configure the S3 bucket for website hosting as shown [in the S3 documentation](https://docs.aws.amazon.com/AmazonS3/latest/dev/HowDoIWebsiteConfiguration.html).
2. In the [Advanced Conditional Redirects section](https://docs.aws.amazon.com/AmazonS3/latest/dev/how-to-page-redirect.html#advanced-conditional-redirects) of the Website Hosting settings for the S3 bucket, set up the following redirect rule:

```
<RoutingRules>
  <RoutingRule>
    <Condition>
      <HttpErrorCodeReturnedEquals>404</HttpErrorCodeReturnedEquals>
    </Condition>
    <Redirect>
      <Protocol>https</Protocol>
      <HostName>your_api_endpoint.execute-api.us-east-1.amazonaws.com</HostName>
      <ReplaceKeyPrefixWith>dev-1/</ReplaceKeyPrefixWith>
      <HttpRedirectCode>307</HttpRedirectCode>
    </Redirect>
  </RoutingRule>
</RoutingRules>
```

You will need to replace `your_api_endpoint` part with the URL of your Serverless endpoint. You can find out what’s the endpoint URL by running:

```
serverless info
```

or observing the output of the deployment step.

## Local development

You can run the API locally with `serverless-offline`:

```bash
npm run offline
```

## Any questions or suggestions?

Please feel free to open an issue on this repository if something doesn’t work is doesn’t behave as described here. Thanks for giving this project a try!
