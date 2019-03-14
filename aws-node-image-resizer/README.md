<!--
title: 'Dynamic Image Resizing API'
description: 'This example shows you how to setup a dynamic image resizer API'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/sebito91'
authorName: 'Sebastian Borza'
authorAvatar: 'https://avatars0.githubusercontent.com/u/3159454?v=4&s=140'
-->

# Dynamic image resizing with Node.js and Serverless framework

In this example, we set up a dynamic image resizing solution with AWS S3 and a Serverless framework function written in Node.js. We use [the `sharp` package](https://www.npmjs.com/package/sharp) for image resizing.

`sharp` includes native dependencies, so in this example we are building and deploying the Serverless function from a Docker container that’s based on Amazon Linux.

## Pre-requisites

In order to deploy the function, you will need the following:

- API credentials for AWS, with Administrator permissions (for simplicity, not recommended in production).
- An S3 bucket in your AWS account.
- Serverless framework installed locally via `yarn global add serverless`.
- Node.js 8 and `yarn` installed locally.
- Docker and docker-compose installed locally.

## Deploying the Serverless project

1. Clone the repository and install the dependencies:\

```
yarn
```

2. Add your AWS credentials into the `secrets/secrets.env` file.
3. Deploy the Serverless project:\

```
docker-compose up --build
```

## Setting up the S3 bucket

Make sure that your S3 bucket is public. Then follow these additional setup steps:

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

## Any questions or suggestions?

Please feel free to open an issue on this repository if something doesn’t work is doesn’t behave as described here. Thanks for giving this project a try!
