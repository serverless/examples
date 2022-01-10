<!--
title: 'S3 Image Thumbnailer'
description: 'This example shows you how to setup a lambda function which, triggered by upload to a source S3 bucket, resizes images to thumbnails and uploads to a thumbnail bucket. '
layout: Doc
framework: v1
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/mrjackmclean'
authorName: 'Jack McLean'
authorAvatar: 'https://avatars.githubusercontent.com/u/67237620?v=4'
-->

# Image Thumbnail Creater with Node.js, AWS and Serverless framework

In this example, we set up a lambda function on AWS. When an image is uploaded to the specified S3 bucket, it triggers the lambda function which resizes the image and adds it to the specified thumbnail bucket. The [`sharp` package](https://www.npmjs.com/package/sharp) is used for image resizing.

The serverless example here is loosely adapted from the tutorial [Using an Amazon S3 trigger to create thumbnail images](https://docs.aws.amazon.com/lambda/latest/dg/with-s3-tutorial.html).

## Pre-requisites

In order to deploy the function, you will need the following:

- Serverless framework installed locally via `npm install -g serverless`.
- API credentials for AWS with Administrator permissions configured in serverless (see [here](https://www.serverless.com/framework/docs/providers/aws/guide/credentials)).
- Node.js (and npm) installed locally.

## Deploying the Serverless project

1. Clone the repository and install the dependencies (use a wsl terminal - On Windows 10, [install the Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install) to get a Windows-integrated version of Ubuntu and Bash.):\

```
npm install
```

2. Open the `handler.js` file and assign globally unique names to the variables `SOURCE_BUCKET_NAME` and `OUTPUT_BUCKET_NAME`.

3. Deploy using serverless (not necessary to use the wsl terminal)

```
serverless deploy
```

## Have a suggestion?

Feel free to open an issue on this repository if something doesn’t work or you find an issue. Thanks for reading!
