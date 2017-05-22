<!--
title: AWS Single Page Application example in NodeJS
description: This example demonstrates how to setup a Single Page Application.
layout: Doc
-->
# Single Page Application

This example demonstrates how to setup a Single Page Application. Our goals here are to serve a static page with low latency. One additional goal is to make sure the client side application can leverage the History API functions `pushState` and `replaceState` to change the current URL without reloading. Further we want to make sure all the content is only served via HTTPS. HTTP requests should get redirected to HTTPS.

To achieve these goals we use S3 in combination with CloudFront. S3 is used to store our static HTML file while CloudFront is responsible for making it available via Amazon's Content Delivery Network.

## Prerequisite

The `serverless-single-page-app-plugin` in this example requires the Serverless Framework version 1.2.0 or higher and the AWS Command Line Interface. Learn more [here](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) on how to install the AWS Command Line Interface.

## Setup

Replace the bucket name in `serverless.yaml` which you can find inside the `custom` section. There is a placeholder text `yourBucketName123`. This is due the fact that bucket names must be globally unique across all AWS S3 buckets.

Since this plugin uses a custom Serverless plugin you need to setup the `node_modules` by running:

```bash
npm install
```

The `serverless-single-page-app-plugin` plugin in this example is there to simplify the experience using this example. It's not necessary to understand the plugin to deploy your Single Page Application.

# Deploy

Warning: Whenever you making changes to CloudFront resource in `serverless.yml` the deployment might take a while e.g 15-20 minutes.

In order to deploy the Single Page Application you need to setup the infrastructure first by running

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service…
Serverless: Uploading CloudFormation file to S3…
Serverless: Uploading service .zip file to S3…
Serverless: Updating Stack…
Serverless: Checking Stack update progress…
...........................
Serverless: Stack update finished…

Service Information
service: serverless-simple-http-endpoint
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  None
```

After this step your S3 bucket and CloudFront distribution is setup. Now you need to upload your static file e.g. `index.html` and `app.js` to S3. You can do this by running

```bash
serverless syncToS3
```

The expected result should be similar to

```bash
Serverless: upload: app/index.html to s3://yourBucketName123/index.html
Serverless: upload: app/app.js to s3://yourBucketName123/app.js
Serverless: Successfully synced to the S3 bucket
```

Hint: The plugin is simply running the AWS CLI command: `aws S3 sync app/ s3://yourBucketName123/`

Now you just need to figure out the deployed URL. You can use the AWS Console UI or run

```bash
sls domainInfo
```

The expected result should be similar to

```bash
Serverless: Web App Domain: dyj5gf0t6nqke.cloudfront.net
```

Visit the printed domain domain and navigate on the web site. It should automatically redirect you to HTTPS and visiting <yourURL>/about will not result in an error with the status code 404, but rather serves the `index.html` and renders the about page.

This is how it should look like: ![Screenshot](https://cloud.githubusercontent.com/assets/223045/20391786/287cb310-acd5-11e6-9eaf-89f641ed9e14.png)

## Further Improvements

Here a list of potential improvements you can do with your CloudFront setup depending on your use-case:

- Setup a custom domain alias
- Logging for CloudFront requests
- Setup a restriction so the Bucket is not publicly accessible except via CloudFront
