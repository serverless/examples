# AWS Node Signed Uploads

## Requirements

* Node.js (version 8 is best at the moment)
* npm which comes with Node.js
* yarn

## Introduction

The approach implemented in this service is useful when you want to use [Amazon API Gateway](https://aws.amazon.com/api-gateway/) and you want to solve the 10MB payload limit.

The service is based on the [serverless](https://serverless.com/) framework. The service is uploading objects to a specific S3 bucket using a [pre-signed URL](http://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html). Implemented in node.js runtime using [getSignedUrl](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property) method.

The package is targeting the latest runtime of AWS Lambda. ([8.10](https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/))

## Settings

If you prefer to use a different region or stage, change these:

```sh
$ export AWS_STAGE=
$ export AWS_REGION=
```

Defaults are `dev` and `eu-central-1`.

Change name of upload bucket:

```yaml
bucketName: testBucket
```

### File name to sign

The file you want to upload is signed via `x-amz-meta-filekey` header.

### How to use

Get dependencies with `yarn` or `npm install`. The following examples will assume the usage of `yarn`.

Issue a `GET` request to get the signed URL:

```sh
curl --request GET \
  --url https://{serviceID}.execute-api.{region}.amazonaws.com/dev/upload \
  --header 'x-amz-meta-filekey: the-road-to-graphql.pdf'
```

If your bucket is called `foo`, and you upload `the-road-to-graphql`, after receiving the signed URL, issue a `PUT` request with the information you have signed:

```sh
curl --request PUT \
  --url 'https://foo.s3.eu-central-1.amazonaws.com/the-road-to-graphql.pdf?X-Amz-SignedHeaders=host&X-Amz-Signature=the-signature&X-Amz-Security-Token=the-token&X-Amz-Expires=30&X-Amz-Date=20181210T113015Z&X-Amz-Credential=something10%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Algorithm=AWS4-HMAC-SHA256' \
  --data 'somemething-awesome'
```

### Integrations

Here's a short list of possible integrations I found making a quick Google search:

* [Using pre-signed URLs to upload a file to a private S3 bucket](https://sanderknape.com/2017/08/using-pre-signed-urls-upload-file-private-s3-bucket/)
* [react-s3-uploader](https://www.npmjs.com/package/react-s3-uploader)

### Develop locally

Starting a local dev server and its endpoint for receiving uploads:

```bash
$ yarn start
```

### Linter

Starting the linter tasks:

```bash
$ yarn lint
```

### Deployment

[Setup your AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

Run the following the fire the deployment:

```bash
$ yarn deploy
```
