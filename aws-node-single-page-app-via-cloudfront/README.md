<!--
title: 'AWS Single Page Application example in NodeJS'
description: 'This example demonstrates how to setup a Single Page Application.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/erezrokah'
authorName: 'Erez Rokah'
authorAvatar: 'https://avatars0.githubusercontent.com/u/26760571?v=4&s=140'
-->
# Single Page Application

This example demonstrates how to setup a Single Page Application. Our goals here are to serve a static page with low latency. One additional goal is to make sure the client side application can leverage the History API functions `pushState` and `replaceState` to change the current URL without reloading. Further we want to make sure all the content is only served via HTTPS. HTTP requests should get redirected to HTTPS.

To achieve these goals we use S3 in combination with CloudFront. S3 is used to store our static HTML file while CloudFront is responsible for making it available via Amazon's Content Delivery Network.

## Prerequisite

[Node.js](https://nodejs.org/en/) 24

The `serverless-single-page-app-plugin` in this example requires Serverless Framework v4 and the AWS Command Line Interface. Learn more [here](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) on how to install the AWS Command Line Interface.

## Setup

Since this plugin uses a custom Serverless plugin you need to setup the `node_modules` by running:

```bash
npm install
```

The `serverless-single-page-app-plugin` plugin in this example is there to simplify the experience using this example. It's not necessary to understand the plugin to deploy your Single Page Application.

# Deploy

Warning: Whenever you making changes to CloudFront resource in `serverless.yml` the deployment might take a while e.g 20 minutes.

In order to deploy the Single Page Application you need to setup the infrastructure first by running

```bash
serverless deploy
```

The expected result should be similar to:

```
Deploying "single-page-app-via-cloudfront7" to stage "dev" (us-east-1)

✔ Service deployed to stack single-page-app-via-cloudfront7-dev (612s)
```

After this step your S3 bucket and CloudFront distribution is setup. CloudFormation generates a unique name for the bucket, which the plugin reads from the stack outputs. Now you need to upload your static file e.g. `index.html` and `app.js` to S3. You can do this by running

```bash
serverless syncToS3
```

The expected result should be similar to

```bash
Serverless: upload: app/index.html to s3://<generated-bucket-name>/index.html
Serverless: upload: app/app.js to s3://<generated-bucket-name>/app.js
Serverless: Successfully synced to the S3 bucket
```

Hint: The plugin looks up the bucket name from the stack outputs and simply runs the AWS CLI command: `aws s3 sync app/ s3://<generated-bucket-name>/`

Now you just need to figure out the deployed URL. You can use the AWS Console UI or run

```bash
sls domainInfo
```

The expected result should be similar to

```bash
Serverless: Web App Domain: dyj5gf0t6nqke.cloudfront.net
```

Visit the printed domain domain and navigate on the web site. It should automatically redirect you to HTTPS and visiting <yourURL>/about will not result in an error with the status code 404, but rather serves the `index.html` and renders the about page.

This is how it should look like: ![Screenshot](https://cloud.githubusercontent.com/assets/223045/20391786/287cb3acd5-11e6-9eaf-89f641ed9e14.png)

# Re-deploying

If you make changes to your Single Page Application you might need to invalidate CloudFront's cache to make sure new files are served.
Meaning, run:

```bash
serverless syncToS3
```

To sync your files and then:

```bash
serverless invalidateCloudFrontCache
```

## Further Improvements

Here a list of potential improvements you can do with your CloudFront setup depending on your use-case:

- Setup a custom domain alias
- Logging for CloudFront requests
- Setup a restriction so the Bucket is not publicly accessible except via CloudFront
