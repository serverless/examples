# Fetch image from URL then upload to s3 Example

This example display how to fetch an image from remote source(URL) and then upload this image to S3 bucket.

## Use-cases

- Store user's profile from another service.

## How it works

We first fetch the data from given url and then call s3 API `putObject` to upload it to the bucket.

```js
  AWS.config.setPromisesDependency(require('bluebird'));
  fetch('image URL')
    .then(res => {
      return s3.putObject({Bucket, Key, Body: res.body}).promise();
    }).then(res => {
      callback(null, res);
    }).catch(err => {
      callback(err, null);
    });
```

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (1.01 KB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
...........................
Serverless: Stack update finished...

Service Information
service: aws-node-upload-to-s3
stage: dev
region: us-west-1
api keys:
  None
endpoints:
  GET - https://nzkl1kas89.execute-api.us-west-1.amazonaws.com/dev/landing-page
functions:
  serve-dynamic-html-via-http-endpoint-dev-landingPage: arn:aws:lambda:us-east-1:377024778620:function:serve-dynamic-html-via-http-endpoint-dev-landingPage
```

## Usage

You can now send an HTTP request directly to the endpoint using a tool like curl

```bash
serverless invoke -f upload -d event.json
```


## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
