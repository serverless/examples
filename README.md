[Website](http://www.serverless.com) • [Email Updates](http://eepurl.com/b8dv4P) • [Gitter](https://gitter.im/serverless/serverless) • [Forum](http://forum.serverless.com) • [Meetups](https://github.com/serverless/meetups) • [Twitter](https://twitter.com/goserverless) • [Facebook](https://www.facebook.com/serverless) • [Contact Us](mailto:hello@serverless.com)

# Serverless Examples

<img align="right" width="300" src="https://s3-us-west-2.amazonaws.com/assets.site.serverless.com/email/sls-getting-started.gif" />

A collection of ready-to-deploy [Serverless Framework](https://github.com/serverless/serverless) services.

## Table of Contents
<details>
<summary>Click to expand</summary>

- [Serverless Examples](#serverless-examples)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Examples](#examples)
  - [Community Examples](#community-examples)
  - [Contributing](#contributing)
    - [Adding example code](#adding-example-code)
    - [Adding a community example](#adding-a-community-example)

</details>

## Getting Started

If you are new to serverless, we recommend getting started with by creating an HTTP API Endpoint in [NodeJS](https://github.com/serverless/examples/tree/v3/aws-node-simple-http-endpoint), [Python](https://github.com/serverless/examples/tree/v3/aws-python-simple-http-endpoint), [Java](https://github.com/serverless/examples/tree/v3/aws-java-simple-http-endpoint), or [Golang](https://github.com/serverless/examples/tree/v3/aws-golang-simple-http-endpoint).


| <br>**[Try Serverless Console](https://bit.ly/3kL8ACL)**<br>Monitor, observe, and trace your serverless architectures. Real-time dev mode provides streaming logs from your AWS Lambda Functions.<br><br> |
|---|


## Examples

Each example contains a `README.md` with an explanation about the service and it's use cases.

**Have an example?** Submit a PR or [open an issue](https://github.com/serverless/examples/issues). ⚡️

To install any of these you can run:

```bash
serverless install -u https://github.com/serverless/examples/tree/v3/folder-name -n my-project
```

<!-- AUTO-GENERATED-CONTENT:START (SERVERLESS_EXAMPLE_TABLE) t generated w/ `npm run docs` -->
| Example | Runtime  |
|:--------------------------- |:-----|
| [.NET REST API with DynamoDB](https://github.com/serverless/examples/tree/v3/aws-dotnet-rest-api-with-dynamodb/src/DotNetServerless.Lambda) <br/> Reading/Writing operations using .NET Core and DynamoDB | csharp |
| [AWS FFmepg Layer](https://github.com/serverless/examples/tree/v3/aws-ffmpeg-layer) <br/> AWS FFmepg Layer & a service using it to create GIFs | node |
| [AWS Golang Auth](https://github.com/serverless/examples/tree/v3/aws-golang-auth-examples) <br/> These example shows how to run a Golang lambda with authentication | go |
| [DynamoDB Stream To Elasticsearch](https://github.com/serverless/examples/tree/v3/aws-golang-dynamo-stream-to-elasticsearch) <br/> This example deploys a DynamoDB Table, an Elasticsearch Node, and a lambda triggered off of a Dynamo Stream which updates an elasticsearch index with the data from the Dynamo Table | go |
| [HTTP GET and POST](https://github.com/serverless/examples/tree/v3/aws-golang-http-get-post) <br/> Example on Making Parameterized Get and Post Request with Golang | go |
| [AWS golang rest api with dynamodb](https://github.com/serverless/examples/tree/v3/aws-golang-rest-api-with-dynamodb) <br/> Serverless CRUD service exposing a REST HTTP interface | go |
| [AWS Golang HTTP GET endpoint](https://github.com/serverless/examples/tree/v3/aws-golang-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with golang | go |
| [AWS Golang Kinesis to Elasticsearch](https://github.com/serverless/examples/tree/v3/aws-golang-stream-kinesis-to-elasticsearch) <br/> Pull data from AWS Kinesis streams and forward to elasticsearch | go |
| [AWS Alexa Skill](https://github.com/serverless/examples/tree/v3/aws-node-alexa-skill) <br/> This example demonstrates how to use an AWS Lambdas for your custom Alexa skill. | node |
| [API Gateway Authorizer Function for Auth0 or AWS Cognito using RS256 JSON Web Key Sets tokens.](https://github.com/serverless/examples/tree/v3/aws-node-auth0-cognito-custom-authorizers-api) <br/> Authorize your API Gateway with either Auth0 or Cognito RS256 tokens. | node |
| [AWS protecting API Gateway with Auth0](https://github.com/serverless/examples/tree/v3/aws-node-auth0-custom-authorizers-api) <br/> Demonstration of protecting API gateway endpoints with auth0 | node |
| [Dynamic Image Resizing API](https://github.com/serverless/examples/tree/v3/aws-node-dynamic-image-resizer) <br/> This example shows you how to setup a dynamic image resizer API | node |
| [AWS DynamoDB to S3 backup in Node.js](https://github.com/serverless/examples/tree/v3/aws-node-dynamodb-backup) <br/> Serverless DynamoDB changes backed up to S3 | node |
| [AWS environment variables encrypted in a file](https://github.com/serverless/examples/tree/v3/aws-node-env-variables-encrypted-in-a-file) <br/> Serverless example managing secrets in an encrypted file | node |
| [AWS environment variables](https://github.com/serverless/examples/tree/v3/aws-node-env-variables) <br/> This example demonstrates how to use environment variables for AWS Lambdas. | node |
| [Serverless Framework Node Express API on AWS](https://github.com/serverless/examples/tree/v3/aws-node-express-api) <br/> This template demonstrates how to develop and deploy a simple Node Express API running on AWS Lambda using the traditional Serverless Framework. | node |
| [Serverless Framework Node Express API service backed by DynamoDB on AWS](https://github.com/serverless/examples/tree/v3/aws-node-express-dynamodb-api) <br/> This template demonstrates how to develop and deploy a simple Node Express API service backed by DynamoDB running on AWS Lambda using the traditional Serverless Framework. | node |
| [AWS fetch a file and store it in S3](https://github.com/serverless/examples/tree/v3/aws-node-fetch-file-and-store-in-s3) <br/> Fetch an image from remote source (URL) and then upload the image to a S3 bucket. | node |
| [Serverless Email Sign Up Form](https://github.com/serverless/examples/tree/v3/aws-node-fullstack/backend) <br/> This example demonstrates how to deploy a Fullstack serverless application | node |
| [Serverless Email Sign Up Form](https://github.com/serverless/examples/tree/v3/aws-node-fullstack/frontend) <br/> This example demonstrates how to deploy a Fullstack serverless application | node |
| [AWS compiling a Lambda function with Babel](https://github.com/serverless/examples/tree/v3/aws-node-function-compiled-with-babel) <br/> Demonstrating how to compile all your code with Babel | node |
| [Serverless Github Check](https://github.com/serverless/examples/tree/v3/aws-node-github-check) <br/> The idea is to validate that all Pull Requests are related to a specific trello card. | node |
| [AWS GitHub webhook listener](https://github.com/serverless/examples/tree/v3/aws-node-github-webhook-listener) <br/> Extend your github repositories with this github webhook listener | node |
| [A Simple Serverless GraphQL API for MySQL, Postgres and Aurora](https://github.com/serverless/examples/tree/v3/aws-node-graphql-and-rds) <br/> This is an example project that uses 3 RDS databases to illustrate the differences between using each of them | node |
| [GraphQL query endpoint in NodeJS on AWS with DynamoDB](https://github.com/serverless/examples/tree/v3/aws-node-graphql-api-with-dynamodb) <br/> A single-module GraphQL endpoint with query and mutation functionality. | node |
| [AWS Lambda, Heroku and Postgres](https://github.com/serverless/examples/tree/v3/aws-node-heroku-postgres) <br/> Shows how to connect AWS Lambda to Heroku Postgres. Uses an api:release Heroku webhook and the Heroku API to handle automatic Heroku Postgres credential rotation. | node |
| [AWS Node.js HTTP API with DynamoDB local](https://github.com/serverless/examples/tree/v3/aws-node-http-api-dynamodb-local) <br/> Serverless HTTP API with DynamoDB and offline support | node |
| [AWS HTTP API using NodeJS and DynamoDB](https://github.com/serverless/examples/tree/v3/aws-node-http-api-dynamodb) <br/> Serverless CRUD service exposing a REST HTTP interface | node |
| [AWS HTTP API with MongoDB](https://github.com/serverless/examples/tree/v3/aws-node-http-api-mongodb) <br/> Serverless HTTP API with MongoDB using Mongoose and Bluebird | node |
| [AWS HTTP API with Typescript and DynamoDB](https://github.com/serverless/examples/tree/v3/aws-node-http-api-typescript-dynamodb) <br/> A simple HTTP API with TypeScript running on AWS Lambda and API Gateway, using DynamoDB as a datastore. | node |
| [AWS HTTP API with TypeScript](https://github.com/serverless/examples/tree/v3/aws-node-http-api-typescript) <br/> A simple HTTP API with TypeScript running on AWS Lambda and API Gateway deployed with Serverless Framework. | node |
| [AWS IoT events to Lambda](https://github.com/serverless/examples/tree/v3/aws-node-iot-event) <br/> Example on how to setup a AWS IoT Rule to send events to a Lambda function | node |
| [AWS Lambda And MongoDB Atlas](https://github.com/serverless/examples/tree/v3/aws-node-mongodb-atlas) <br/> Shows how to connect AWS Lambda to MongoDB Atlas. | node |
| [Dropbox OAuth2 integration](https://github.com/serverless/examples/tree/v3/aws-node-oauth-dropbox-api) <br/> Dropbox integration | node |
| [Running Puppeteer on AWS Lambda](https://github.com/serverless/examples/tree/v3/aws-node-puppeteer) <br/> When it comes to AWS Lambda function , they have their own limits as follows ![AWS Limits](./images/aws_limits.png) So , When you try to use Puppeteer your deployment package size(unzipped)  easily go's above 250 mb because When you install Puppeteer, it downloads a recent version of Chromium (~170MB Mac, ~282MB Linux, ~280MB Win) that is guaranteed to work with the API. | node |
| [AWS Analyse Image from S3 with Amazon Rekognition example in NodeJS](https://github.com/serverless/examples/tree/v3/aws-node-rekognition-analysis-s3-image) <br/> Analyse an Image from an S3 Bucket with Amazon Rekognition | node |
| [AWS REST API with MongoDB, Mongoose and Bluebird](https://github.com/serverless/examples/tree/v3/aws-node-rest-api-mongodb) <br/> Serverless REST API with MongoDB using Mongoose and Bluebird | node |
| [Serverless Nodejs Rest API with TypeScript And MongoDB Atlas](https://github.com/serverless/examples/tree/v3/aws-node-rest-api-typescript-simple) <br/> This is simple REST API example for AWS Lambda By Serverless framwork with TypeScript and MongoDB Atlas. | node |
| [AWS Typescript REST API](https://github.com/serverless/examples/tree/v3/aws-node-rest-api-typescript) <br/> This is simple REST API example for AWS Lambda By Serverless framwork with TypeScript and MongoDB Atlas. | node |
| [AWS REST API with DynamoDB and offline support](https://github.com/serverless/examples/tree/v3/aws-node-rest-api-with-dynamodb-and-offline) <br/> Serverless REST API with DynamoDB and offline support | node |
| [AWS Rest With Dynamodb](https://github.com/serverless/examples/tree/v3/aws-node-rest-api-with-dynamodb) <br/> Serverless CRUD service exposing a REST HTTP interface | node |
| [AWS fetch a file and store it in S3](https://github.com/serverless/examples/tree/v3/aws-node-s3-file-replicator) <br/> Fetch an image from remote source (URL) and then upload the image to a S3 bucket. | node |
| [AWS Scheduled Cron](https://github.com/serverless/examples/tree/v3/aws-node-scheduled-cron) <br/> Example of creating a function that runs as a cron job using the serverless `schedule` event | node |
| [AWS Scheduled Weather](https://github.com/serverless/examples/tree/v3/aws-node-scheduled-weather) <br/> Example of creating a function that runs as a cron job using the serverless `schedule` event through pulling weather and sending an email daily. | node |
| [AWS Serve Dynamic Html Via HTTP Endpoint](https://github.com/serverless/examples/tree/v3/aws-node-serve-dynamic-html-via-http-endpoint) <br/> Hookup an AWS API Gateway endpoint to a Lambda function to render HTML on a `GET` request | node |
| [The Serverless Gong](https://github.com/serverless/examples/tree/v3/aws-node-serverless-gong) <br/> A simple serverless gong using GitHub webhooks and a Slack app | node |
| [AWS SES receive emails and process body](https://github.com/serverless/examples/tree/v3/aws-node-ses-receive-email-body) <br/> Receive an email, store in S3 bucket, trigger a lambda function. | node |
| [AWS SES receive an email, trigger a lambda function to process header.](https://github.com/serverless/examples/tree/v3/aws-node-ses-receive-email-header) <br/> Receive an email, trigger a lambda function to process header. | node |
| [Shared Aws Api Gateway Nodejs](https://github.com/serverless/examples/tree/v3/aws-node-shared-gateway) <br/> A sample of implementing shared API gateway with multiple Node Lambdas. | node |
| [AWS Node Signed Uploads](https://github.com/serverless/examples/tree/v3/aws-node-signed-uploads) <br/> Serverless example for S3 signed uploads | node |
| [AWS Serve Simple HTTP Endpoint](https://github.com/serverless/examples/tree/v3/aws-node-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint | node |
| [Simple AWS Transcribe example in NodeJS](https://github.com/serverless/examples/tree/v3/aws-node-simple-transcribe-s3) <br/> Example demonstrates how to setup a lambda function to transcribe audio file | node |
| [AWS Single Page App Via Cloudfront](https://github.com/serverless/examples/tree/v3/aws-node-single-page-app-via-cloudfront) <br/> Demonstrating how to deploy a Single Page Application with Serverless | node |
| [Serverless Single Page App Plugin](https://github.com/serverless/examples/tree/v3/aws-node-single-page-app-via-cloudfront/serverless-single-page-app-plugin) <br/> A plugin to simplify deploying Single Page Application using S3 and CloudFront | node |
| [Serverless Framework Node SQS Producer Consumer on AWS](https://github.com/serverless/examples/tree/v3/aws-node-sqs-worker) <br/> Serverless Framework Node SQS Producer-Consumer on AWS | node |
| [AWS Stripe Integration example in NodeJS](https://github.com/serverless/examples/tree/v3/aws-node-stripe-integration) <br/> This example for Stripe integration using AWS Lambda and API Gateway. | node |
| [AWS Node Line Echo Bot](https://github.com/serverless/examples/tree/v3/aws-node-telegram-echo-bot) <br/> This is a simple echo bot on Telegram | node |
| [AWS Text Analysis Via Sns Post Processing](https://github.com/serverless/examples/tree/v3/aws-node-text-analysis-via-sns-post-processing) <br/> Example demonstrates how to setup a simple data processing pipeline | node |
| [AWS Send SMS Message with Twilio example in NodeJS](https://github.com/serverless/examples/tree/v3/aws-node-twilio-send-text-message) <br/> Send a text message via twilio from aws lambda. [See live demo](http://twilio-serverless-example.surge.sh) | node |
| [Joke Twitter Bot](https://github.com/serverless/examples/tree/v3/aws-node-twitter-joke-bot) <br/> Twitter bot that will periodically tweet out a joke obtained from a joke API. | node |
| [AWS Apollo Lambda (NodeJS & Typescript)](https://github.com/serverless/examples/tree/v3/aws-node-typescript-apollo-lambda) <br/> Serverless example for apollo lambda | node |
| [AWS Kinesis Data Streams Example (NodeJS & Typescript)](https://github.com/serverless/examples/tree/v3/aws-node-typescript-kinesis) <br/> Serverless example using Kinesis with TypeScript | node |
| [Nest Serverless](https://github.com/serverless/examples/tree/v3/aws-node-typescript-nest) <br/> serverless app | node |
| [AWS TypeScript REST API with DynamoDB](https://github.com/serverless/examples/tree/v3/aws-node-typescript-rest-api-with-dynamodb) <br/> This example shows your how to create a TypeScript powered REST API with DynamoDB. | node |
| [AWS SQS Standard Example (NodeJS & Typescript)](https://github.com/serverless/examples/tree/v3/aws-node-typescript-sqs-standard) <br/> Serverless example using Standard SQS with TypeScript | node |
| [AWS TypeScript example](https://github.com/serverless/examples/tree/v3/aws-node-typescript) <br/> This template demonstrates how to deploy a TypeScript function running on AWS Lambda using the traditional Serverless Framework. | node |
| [Upload To S3 And Postprocess](https://github.com/serverless/examples/tree/v3/aws-node-upload-to-s3-and-postprocess) <br/> Upload a files to S3 to trigger a lambda function. | node |
| [Serverless side rendering with Vue.js and Nuxt.js](https://github.com/serverless/examples/tree/v3/aws-node-vue-nuxt-ssr) <br/> Sample project for using Nuxt.js to create a server-side rendered Vue.js app on AWS Lambda and AWS API Gateway. Can easily integrate with your own API or 3rd party APIs such as headless CMS, e-commerce or serverless architecture. | node |
| [AWS Nodejs Websockets Authorizers](https://github.com/serverless/examples/tree/v3/aws-node-websockets-authorizers) <br/> Simple example that demonstrates how to use authorizer functions with websocket events | node |
| [AWS Alexa Skill](https://github.com/serverless/examples/tree/v3/aws-python-alexa-skill) <br/> This example demonstrates how to use an AWS Lambdas for your custom Alexa skill. | python |
| [AWS protecting API Gateway with Auth0](https://github.com/serverless/examples/tree/v3/aws-python-auth0-custom-authorizers-api) <br/> Demonstration of protecting API gateway endpoints with auth0 | python |
| [Serverless Framework Python Flask API on AWS](https://github.com/serverless/examples/tree/v3/aws-python-flask-api) <br/> Example of a Python Flask API service with traditional Serverless Framework | python |
| [Serverless Framework Python Flask API backed by DynamoDB on AWS](https://github.com/serverless/examples/tree/v3/aws-python-flask-dynamodb-api) <br/> Example of a Python Flask API service backed by DynamoDB with traditional Serverless Framework | python |
| [AWS HTTP With Dynamodb](https://github.com/serverless/examples/tree/v3/aws-python-http-api-with-dynamodb) <br/> Serverless HTTP API | python |
| [AWS HTTP With Pynamodb](https://github.com/serverless/examples/tree/v3/aws-python-http-api-with-pynamodb) <br/> Serverless CRUD service exposing an HTTP API | python |
| [Simple LINE bot](https://github.com/serverless/examples/tree/v3/aws-python-line-echo-bot) <br/> this is echo bot on LINE message | python |
| [AWS Serverless REST API with DynamoDB store and presigned URLs example in Python 3.6.](https://github.com/serverless/examples/tree/v3/aws-python-pynamodb-s3-sigurl) <br/> Serverless signed uploader REST API using pynamodb, s3 generated events, custom log format, and DRY serverless.yml with custom section | python |
| [AWS Rest With Dynamodb](https://github.com/serverless/examples/tree/v3/aws-python-rest-api-with-dynamodb) <br/> Serverless CRUD service exposing a REST HTTP interface | python |
| [AWS Rest With Faunadb](https://github.com/serverless/examples/tree/v3/aws-python-rest-api-with-faunadb) <br/> Serverless CRUD service exposing a REST HTTP interface | python |
| [AWS Python Rest API with Pymongo](https://github.com/serverless/examples/tree/v3/aws-python-rest-api-with-pymongo) <br/> Serverless pymongo example | python |
| [AWS Rest With Pynamodb](https://github.com/serverless/examples/tree/v3/aws-python-rest-api-with-pynamodb) <br/> Serverless CRUD service exposing a REST HTTP interface | python |
| [AWS Scheduled Cron](https://github.com/serverless/examples/tree/v3/aws-python-scheduled-cron) <br/> Example of creating a function that runs as a cron job using the serverless `schedule` event | python |
| [AWS Simple HTTP Endpoint](https://github.com/serverless/examples/tree/v3/aws-python-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with python | python |
| [Serverless Framework Python SQS Producer Consumer on AWS](https://github.com/serverless/examples/tree/v3/aws-python-sqs-worker) <br/> Serverless Framework Python SQS Producer-Consumer on AWS | python |
| [Serverless Telegram Bot](https://github.com/serverless/examples/tree/v3/aws-python-telegram-bot) <br/> This example demonstrates how to setup an echo Telegram Bot using the Serverless Framework ⚡🤖  | python |
| [Serverless Ruby Dynamodb Cron](https://github.com/serverless/examples/tree/v3/aws-ruby-cron-with-dynamodb) <br/> This is an example of creating a function that runs as a cron job using the serverless 'schedule' event. With the usage of the AWS Lambda function, it creates a record to the DynamoDB each and every 30 minutes. | ruby |
| [Ruby LINE bot](https://github.com/serverless/examples/tree/v3/aws-ruby-line-bot) <br/> Example demonstrates how to setup a simple Line echo bot on AWS | ruby |
| [AWS Simple HTTP Endpoint example in Ruby](https://github.com/serverless/examples/tree/v3/aws-ruby-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint | ruby |
| [Serverless Framework Ruby Sinatra API backed by DynamoDB on AWS](https://github.com/serverless/examples/tree/v3/aws-ruby-sinatra-dynamodb-api) <br/> Example of a Ruby Sinatra API service backed by DynamoDB with traditional Serverless Framework | ruby |
| [Serverless Ruby Sqs Dynamodb](https://github.com/serverless/examples/tree/v3/aws-ruby-sqs-with-dynamodb) <br/> A serverless ruby example that creates DynamoDB records with the usage of SQS, API Gateway, and AWS Lambda functions. | ruby |
| [Serverless Ruby Sqs Dynamodb](https://github.com/serverless/examples/tree/v3/aws-ruby-sqs-with-dynamodb/src) <br/> A serverless ruby example that creates DynamoDB records with usage of SQS, API Gateway, and AWS Lambda functions | ruby |
| [AWS Ruby Step Functions Express Workflow](https://github.com/serverless/examples/tree/v3/aws-ruby-step-functions-express) <br/> Ruby example that make usage of AWS Step Functions Express Type with AWS Lambda, DynamoDB, Amazon SES, API Gateway, and Step Functions flows | ruby |
| [AWS Ruby Step Functions Callback](https://github.com/serverless/examples/tree/v3/aws-ruby-step-functions-with-callback) <br/> Ruby example that make usage of AWS Step Functions with callback pattern, AWS Lambda, DynamoDB, Amazon Comprehend, API Gateway, and Step Functions flows | ruby |
| [AWS Ruby Step Functions](https://github.com/serverless/examples/tree/v3/aws-ruby-step-functions) <br/> Ruby example that make usage of AWS Step Functions with AWS Lambda, DynamoDB and Step Functions flows. | ruby |
| [AWS Serverless Boilerplate example in Rust](https://github.com/serverless/examples/tree/v3/aws-rust-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with rust | node |
| [Azure Nodejs](https://github.com/serverless/examples/tree/v3/azure-node-line-bot) <br/> Azure Functions sample for the Serverless framework | node |
| [Azure Simple HTTP Endpoint example in NodeJS](https://github.com/serverless/examples/tree/v3/azure-node-simple-http-endpoint) <br/> An example of making http endpoints with the Azure Functions Serverless Framework plugin | node |
| [Azure Nodejs](https://github.com/serverless/examples/tree/v3/azure-node-telegram-bot) <br/> Azure Functions sample for the Serverless framework | node |
| [Service Bus Trigger Example](https://github.com/serverless/examples/tree/v3/azure-node-typescript-servicebus-trigger-endpoint) <br/> Serverless application for asset model creation | node |
| [GCF Simple HTTP Endpoint example in golang](https://github.com/serverless/examples/tree/v3/google-golang-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with golang | go |
| [GCF Simple HTTP Endpoint example in NodeJS](https://github.com/serverless/examples/tree/v3/google-node-simple-http-endpoint) <br/> An example of making http endpoints with the Google Cloud Functions Serverless Framework plugin. | node |
| [GCF Simple HTTP Endpoint example in TypeScript](https://github.com/serverless/examples/tree/v3/google-node-typescript-http-endpoint) <br/> Simple HTTP example for GCP functions by Serverless framework with Typescript | node |
| [GCF Simple HTTP Endpoint example in Python](https://github.com/serverless/examples/tree/v3/google-python-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with python | python |
| [GCF Simple HTTP Endpoint example in Ruby](https://github.com/serverless/examples/tree/v3/google-ruby-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with Ruby | ruby |
| [Kubeless Serverless Simple function example in Python](https://github.com/serverless/examples/tree/v3/kubeless-python-simple-function) <br/> This example demonstrates how to setup a simple Python function with Kubeless | python |
| [Kubeless Serverless Simple scheduled function example in Python](https://github.com/serverless/examples/tree/v3/kubeless-python-simple-scheduled-function) <br/> This example demonstrates how to setup a simple Python function with Kubeless | python |
| [OpenWhisk Serverless Boilerplate example in Go](https://github.com/serverless/examples/tree/v3/openwhisk-go-simple) <br/> Example demonstrates how to setup a simple Go function with OpenWhisk. | node |
| [OpenWhisk Serverless Boilerplate using Docker example in NodeJS](https://github.com/serverless/examples/tree/v3/openwhisk-node-and-docker-chaining-functions) <br/> Example of chaining function calls using sequences and docker images. | node |
| [OpenWhisk Serverless Chaining Functions example in NodeJS](https://github.com/serverless/examples/tree/v3/openwhisk-node-chaining-functions) <br/> Example of chaining function calls using sequences and the sdk. | node |
| [OpenWhisk Serverless Scheduled Cron job example in NodeJS](https://github.com/serverless/examples/tree/v3/openwhisk-node-scheduled-cron) <br/> Example of creating a function that runs as a cron job using the serverless schedule event. | node |
| [Openwhisk Node Simple Http](https://github.com/serverless/examples/tree/v3/openwhisk-node-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with OpenWhisk. | node |
| [OpenWhisk Serverless Simple example in NodeJS](https://github.com/serverless/examples/tree/v3/openwhisk-node-simple) <br/> Simple example demonstrating OpenWhisk provider support. | node |
| [OpenWhisk Serverless Simple example in PHP](https://github.com/serverless/examples/tree/v3/openwhisk-php-simple) <br/> Example demonstrates how to setup a simple PHP function with OpenWhisk. | php |
| [OpenWhisk Serverless Scheduled Cron job example in Python](https://github.com/serverless/examples/tree/v3/openwhisk-python-scheduled-cron) <br/> Example of creating a Python function that runs as a cron job using the serverless schedule event. | python |
| [OpenWhisk Simple HTTP Endpoint example in Python](https://github.com/serverless/examples/tree/v3/openwhisk-python-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with OpenWhisk. | python |
| [OpenWhisk Serverless Simple example in Python](https://github.com/serverless/examples/tree/v3/openwhisk-python-simple) <br/> Example demonstrates how to setup a simple Python function with OpenWhisk. | python |
| [OpenWhisk Serverless Simple example in Ruby](https://github.com/serverless/examples/tree/v3/openwhisk-ruby-simple) <br/> Example demonstrates how to setup a simple Ruby function with OpenWhisk. | ruby |
| [OpenWhisk Serverless Boilerplate example in Rust](https://github.com/serverless/examples/tree/v3/openwhisk-rust-simple-http-endpoint) <br/> Example demonstrates how to setup a simple Rust function with OpenWhisk. | node |
| [Openwhisk Swift Package With Precompiled Binaries](https://github.com/serverless/examples/tree/v3/openwhisk-swift-precompiled-binaries) <br/> Swift packages and pre-compiled binaries on OpenWhisk. | swift |
| [OpenWhisk Serverless Scheduled Cron job example in Swift](https://github.com/serverless/examples/tree/v3/openwhisk-swift-scheduled-cron) <br/> Example of creating a Swift function that runs as a cron job using the serverless schedule event. | swift |
| [OpenWhisk Simple HTTP Endpoint example in Swift](https://github.com/serverless/examples/tree/v3/openwhisk-swift-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP endpoint using Swift function with OpenWhisk. | swift |
| [OpenWhisk Serverless Simple example in Swift](https://github.com/serverless/examples/tree/v3/openwhisk-swift-simple) <br/> Example demonstrates how to setup a simple Swift function with OpenWhisk. | swift |
| [Forwarding calls in Node.js with Twilio](https://github.com/serverless/examples/tree/v3/twilio-node-forward-call) <br/> Example demonstrating Twilio Runtime support with an endpoint that returns TwiML to forward a phone call | node |

<!-- AUTO-GENERATED-CONTENT:END -->

## Community Examples

[Add an example](https://github.com/serverless/examples/edit/master/community-examples.json)

To install any of these you can run:

```bash
serverless install -u https://github.com/author/project -n my-project
```

<!-- AUTO-GENERATED-CONTENT:START (COMMUNITY_EXAMPLES_TABLE)  generated w/ `npm run docs` -->
| Example | Author |
|:-------|:------:|
| **[Aws Api Gateway Serverless Project Written In Go](https://github.com/yunspace/serverless-golang)** <br/> A serverless project that contains an API Gateway endpoint powered by a Lambda function written in golang and built using [eawsy/aws-lambda-go-shim](https://github.com/eawsy/aws-lambda-go-shim). | [yunspace](http://github.com/yunspace) |
| **[Aws Cognito Custom User Pool Example](https://github.com/bsdkurt/aws-node-custom-user-pool)** <br/> Example CloudFormation custom resource backed by a lambda using Cognito User Pools | [bsdkurt](http://github.com/bsdkurt) |
| **[Aws Lambda Power Tuning (Powered By Step Functions)](https://github.com/alexcasalboni/aws-lambda-power-tuning)** <br/> Build a [Step Functions](https://aws.amazon.com/step-functions/) state machine to optimize your AWS Lambda Function memory/power configuration. | [alexcasalboni](http://github.com/alexcasalboni) |
| **[Aws Lambda, Amazon Api Gateway, S3, Dynamodb And Cognito Example](https://github.com/andreivmaksimov/serverless-framework-aws-lambda-amazon-api-gateway-s3-dynamodb-and-cognito)** <br/> Step by step guide how to deploy simple web application on top of AWS Lambda, Amazon API Gateway, S3, DynamoDB and Cognito. | [andreivmaksimov](http://github.com/andreivmaksimov) |
| **[Aws Node Typescript Warmup Lambda Example](https://github.com/Pigius/AWS-Node-Typescript-Warmup-Lambda-Example)** <br/> The following simple example shows how to solve the cold start problem of AWS lambda functions, through keeping function warm using Serverless WarmUp Plugin. | [Pigius](http://github.com/Pigius) |
| **[Aws Demo Java Spring Cloud Function Serverless](https://github.com/mbsambangi/aws-java-spring-cloud-function-demo)** <br/> If Java is your choice of programming language-Spring Cloud Function,Serverless Framework makes a great technology stack. It boosts developer productivity by decoupling from Vendor specific FaaS API, and deployment activities. | [mbsambangi](http://github.com/mbsambangi) |
| **[Amazon Kinesis Streams Fan Out Via Kinesis Analytics](https://github.com/alexcasalboni/kinesis-streams-fan-out-kinesis-analytics)** <br/> Use [Amazon Kinesis Analytics](https://aws.amazon.com/kinesis/analytics/) to fan-out your Kinesis Streams and avoid read throttling. | [alexcasalboni](http://github.com/alexcasalboni) |
| **[Commenting Api](https://github.com/AyoubEd/serverless_typescript_graphQl_commentingService)** <br/> A commenting api using Serverless Typescript GraphQl and Redis | [AyoubEd](http://github.com/AyoubEd) |
| **[Daily Instance Backups With Ami Rotation](https://github.com/AndrewFarley/AWSAutomatedDailyInstanceAMISnapshots)** <br/> A simple Python application which scans through your entire AWS account for tagged instances, makes daily AMIs of them, and rotates their backups automatically | [AndrewFarley](http://github.com/AndrewFarley) |
| **[Demo Project For Serverless Migrate Plugin](https://github.com/EliuX/serverless-migrate-plugin/tree/master/example)** <br/> An example about how to use migrations in your serverless project with serverless-migrate-plugin | [EliuX](http://github.com/EliuX) |
| **[Dropbucket   Serverless File Sharing](https://github.com/marksteele/drop-bucket)** <br/> A serverless file sharing app powered by Cognito/S3/Lambda/API Gateway. Includes a React single-page app UI and virus scanning. | [marksteele](http://github.com/marksteele) |
| **[Express Application With Lambda](https://github.com/HoseungJang/serverless-lambda-express-example)** <br/> This example demonstrates how to build an express application for AWS Lambda based on serverless framework. | [HoseungJang](http://github.com/HoseungJang) |
| **[File Uploads Using S3 Presigned Urls](https://github.com/marchetti2/aws-node-serverless-upload-presigned-url)** <br/> A Serverless photo upload service with API Gateway, S3 presigned URLs and Lambda. | [marchetti2](http://github.com/marchetti2) |
| **[Fotopia Serverless](https://github.com/mbudm/fotopia-serverless)** <br/> A photo archive web app including API, storage and face detection using serverless framework | [mbudm](http://github.com/mbudm) |
| **[Golive](https://github.com/adimoraret/golive/)** <br/> Boilerplate to live stream using AWS MediaLive and MediaStore | [adimoraret](http://github.com/adimoraret) |
| **[Google Logging Event Subscription](https://github.com/gnokoheat/serverless-gcp-logging-event-subscription)** <br/> This example demonstrates how to trigger a cloud functions when a specific event occurs in Google Cloud Platform project. | [gnokoheat](http://github.com/gnokoheat) |
| **[Http Headers Checks](https://github.com/authdog/http-headers-check)** <br/> Serverless Application to check integrity of the headers of a given HTTP server | [authdog](http://github.com/authdog) |
| **[Idempotent Serverless Functions](https://github.com/Nsupyq/idempotent-serverless-functions)** <br/> This repository demonstrates how to ensure the idempotence of serverless functions running on AWS Lambda. | [Nsupyq](http://github.com/Nsupyq) |
| **[Json Serverless](https://github.com/pharindoko/json-serverless)** <br/> A simple & cheap serverless REST API using [json-server](https://github.com/typicode/json-server) in combination with AWS Lambda / S3 and the serverless framework | [pharindoko](http://github.com/pharindoko) |
| **[Lambda Pubsub Via Sns Example](https://github.com/didil/serverless-lambda-sns-example)** <br/> Example illustrating the flow: Lambda (publisher) => SNS => Lambda (consumer) | [didil](http://github.com/didil) |
| **[Monorepo Typescript Microservices](https://github.com/fargito/serverless-monorepo-microservices-template)** <br/> An opinionated Serverless template with several Typescript microservices in a monorepo | [fargito](http://github.com/fargito) |
| **[Nietzsche](https://github.com/rpidanny/Nietzsche)** <br/> A serverless application that fetches quotes from Goodreads and saves it to DynamoDB with example use cases using `Lambda`, `SNS`, `SQS`, `Step Functions`, `DynamoDB`, `API Gateway`, `CloudWatch` | [rpidanny](http://github.com/rpidanny) |
| **[Open Bot](https://github.com/open-bot/open-bot)** <br/> An unoptionated Github bot driven by a configuration file in the repository | [open-bot](http://github.com/open-bot) |
| **[Personal Access Tokens Cron Check](https://github.com/madtrick/cfpat-audit)** <br/> Audit for leaked PAT in your Contentful organization. How to use serverless as cronjobs to keep your Personal Access Tokens secure | [madtrick](http://github.com/madtrick) |
| **[React & Stripe Serverless Ecommerce](https://github.com/patrick-michelberger/serverless-shop)** <br/> Serverless E-Commerce App with AWS Lambda, Stripe and React | [patrick-michelberger](http://github.com/patrick-michelberger) |
| **[Realtime Ww2 Alexa Skill](https://github.com/ceilfors/realtime-ww2-alexa)** <br/> An alexa skill project that's using Alexa SDK. Can also be used for a working example of serverless-webpack (with use of async/await via babel). | [ceilfors](http://github.com/ceilfors) |
| **[Run Your Kubernetes Workloads On Amazon Ec2 Spot Instances With Amazon Eks And Lambda   Part 1](https://github.com/andreivmaksimov/aws-eks-spot-instances-serverless-framework-demo)** <br/> From this tutorial you'll learn how to add AWS EKS Cluster with Spot Instances to your cloud environment managed by Serverless framework | [andreivmaksimov](http://github.com/andreivmaksimov) |
| **[Run Your Kubernetes Workloads On Amazon Ec2 Spot Instances With Amazon Eks And Lambda   Part 2](https://github.com/andreivmaksimov/aws-eks-spot-instances-serverless-framework-demo/tree/part2)** <br/> From this article you'll learn how to configure AWS Lambda functions to allow them manage your EKS Kubernetes cluster and run triggered jobs | [andreivmaksimov](http://github.com/andreivmaksimov) |
| **[Sqs Worker With Aws Lambda And Cloudwatch Alarms](https://github.com/sbstjn/sqs-worker-serverless)** <br/> Process messages stored in SQS with an [auto-scaled AWS Lambda worker](https://sbstjn.com/serverless-sqs-worker-with-aws-lambda.html) function. | [sbstjn](http://github.com/sbstjn) |
| **[Serverless + Lambda + Vpc + Nat + Redis](https://github.com/ittus/aws-lambda-vpc-nat-examples)** <br/> Demo using API Gateway and Lambda with VPC and NAT to access Internet and AWS Resource | [ittus](http://github.com/ittus) |
| **[Serverless Aws Node Notifications](https://github.com/trycourier/aws-node-notifications)** <br/> This template demonstrates how to make a simple HTTP API Endpoint with Node.js running on AWS Lambda and API Gateway using the Serverless Framework to send notifications using Courier. | [trycourier](http://github.com/trycourier) |
| **[Serverless Analytics](https://github.com/sbstjn/serverless-analytics)** <br/> Write your own Google Analytics clone and track website visitors serverless with API Gateway, Kinesis, Lambda, and DynamoDB. | [sbstjn](http://github.com/sbstjn) |
| **[Serverless Appsync Offline Typescript With Circleci](https://github.com/daisuke-awaji/serverless-appsync-offline-typescript-template)** <br/> A Serverless Framework template that allows you to launch an AppSync emulator locally and proceed with development. Lambda Function build by TypeScript/Webpack. | [daisuke-awaji](http://github.com/daisuke-awaji) |
| **[Serverless Architecture Boilerplate](https://github.com/msfidelis/serverless-architecture-boilerplate)** <br/> Boilerplate to organize and deploy big projects using Serverless and CloudFormation on AWS | [msfidelis](http://github.com/msfidelis) |
| **[Serverless Cloudwatch Proxy](https://github.com/abbasdgr8/cloudwatch-proxy)** <br/> Logging adapter that consumes log streams from AWS CloudWatch, streams them to other log destinations. Also capable of identying alerts and sending notifications via Slack/Email | [abbasdgr8](http://github.com/abbasdgr8) |
| **[Serverless Dashboard For Atom Editor](https://github.com/horike37/serverless-dashboard-for-atom)** <br/> Atom editor package which allows you to deploy and visualize your serverless services with Serverless Framework on your editor. | [horike37](http://github.com/horike37) |
| **[Serverless Es6/7 Crud Api](https://github.com/AnomalyInnovations/serverless-stack-demo-api)** <br/> [Serverless Stack](http://serverless-stack.com) examples of backend CRUD APIs (DynamoDB + Lambda + API Gateway + Cognito User Pool authorizer) for [React.js single-page app](http://demo.serverless-stack.com) | [AnomalyInnovations](http://github.com/AnomalyInnovations) |
| **[Serverless Gitlab Ci](https://github.com/bvincent1/serverless-gitlab-ci)** <br/> Simple Gitlab CI template for automatic testing and deployments | [bvincent1](http://github.com/bvincent1) |
| **[Serverless Image Labeller](https://github.com/nileshprasad137/serverless-image-labeller)** <br/> Serverless image labelling using Rekognition, s3, DynamoDB. | [nileshprasad137](http://github.com/nileshprasad137) |
| **[Serverless Instagram Crawler](https://github.com/kimcoder/serverless-instagram-crawler)** <br/> Instagram hashtag Crawler with Lambda & DynamoDB. | [kimcoder](http://github.com/kimcoder) |
| **[Serverless Kakao Bot](https://github.com/JisuPark/serverless-kakao-bot)** <br/> Easy development for Kakaotalk Bot with Serverless | [JisuPark](http://github.com/JisuPark) |
| **[Serverless Lambda S3 Demonstration](https://github.com/johncmunson/serverless-lambda-s3)** <br/> This project demonstrates how the Serverless Framework can be used to deploy a NodeJS Lambda function that responds to events in an S3 bucket. | [johncmunson](http://github.com/johncmunson) |
| **[Serverless Load Balancer](https://github.com/pharindoko/serverless-load-balancer)** <br/> A sample that shows how to combine a load balancer with (vpc/subnet configuration) with a lambda. | [pharindoko](http://github.com/pharindoko) |
| **[Serverless Rds Log Sync S3](https://github.com/drocco007/serverless-aws-rds-logs-s3)** <br/> Annotated exmaple of a periodic scheduled task to sync changed RDS log files to an S3 bucket. | [drocco007](http://github.com/drocco007) |
| **[Serverless Reactjs Universal Rendering Boilerplate](https://github.com/TylorShin/react-universal-in-serverless)** <br/> ReactJS web app Starter kit does universal (isomorphic) rendering with Serverless | [TylorShin](http://github.com/TylorShin) |
| **[Serverless Sns Sqs Offline Example ](https://github.com/kenyipp/serverless-sns-sqs-offline-example)** <br/> Minimal example of running serverless-offline with SQS and SNS in local environment. | [kenyipp](http://github.com/kenyipp) |
| **[Serverless Ssh Command](https://github.com/upgle/serverless-openwhisk-ssh)** <br/> Example of executing ssh command with OpenWhisk | [upgle](http://github.com/upgle) |
| **[Serverless Screenshot To S3](https://github.com/slaytr/aws-node-screenshot-to-s3)** <br/> An example serverless stack which takes a screenshot using aws-chrome-lambda and puts it in s3. NodeJS. | [slaytr](http://github.com/slaytr) |
| **[Serverless Telegram Bot](https://github.com/jonatasbaldin/serverless-telegram-bot)** <br/> This example demonstrates how to setup an echo Telegram Bot using the Serverless Framework ⚡🤖 | [jonatasbaldin](http://github.com/jonatasbaldin) |
| **[Serverless Ffmpeg](https://github.com/kvaggelakos/serverless-ffmpeg)** <br/> Bucket event driven FFMPEG using serverless. Input bucket => Serverless ffmpeg => Output bucket. | [kvaggelakos](http://github.com/kvaggelakos) |
| **[Serverless Sns Api](https://github.com/eddielisc/serverless-sns-api)** <br/> Build a SNS service on AWS, support backend API for SNS by device, by group and by user | [eddielisc](http://github.com/eddielisc) |
| **[Serverless Side Rendering With Vue.js And Nuxt.js](https://github.com/adnanrahic/serverless-side-rendering-vue-nuxt)** <br/> Sample project for using Nuxt.js to create a server-side rendered Vue.js app on AWS Lambda and AWS API Gateway. Can easily integrate with your own API or 3rd party APIs such as headless CMS, e-commerce or serverless architecture. | [adnanrahic](http://github.com/adnanrahic) |
| **[Serving Binary Files](https://github.com/thomastoye/serverless-binary-files-xlsx)** <br/> Small example showing how to serve binary files using Serverless on AWS with the serverless-apigw-binary plugin, using generated Excel files as an example | [thomastoye](http://github.com/thomastoye) |
| **[Spiderless, Web Spider On Serverless](https://github.com/slashbit/spider-less)** <br/> A web spider / scraper / website change detector built with Lambda, API Gateway, DynamoDB and SNS | [slashbit](http://github.com/slashbit) |
| **[Stack Overflow Monitor](https://github.com/picsoung/stackoverflowmonitor)** <br/> Monitor Stack Overflow questions and post them in a Slack channel | [picsoung](http://github.com/picsoung) |
| **[[Unly] Boilerplates Generator](https://github.com/UnlyEd/boilerplates-generator)** <br/> A boilerplates generator, meant to help to quick-start Serverless (AWS Lambda/API GW) and OSS projects, using good defaults _(sentry for automated error handling, staging/prod environments, built-in support for env vars, jest support, babel/webpack)_, yet flexible to fit your needs. | [UnlyEd](http://github.com/UnlyEd) |
| **[Adoptable Pet Bot](https://github.com/lynnaloo/adoptable-pet-bot)** <br/> Tweets adoptable pets using Serverless (Node.js) and AWS Lambda | [lynnaloo](http://github.com/lynnaloo) |
| **[Aws Mfa Enforce](https://github.com/Chan9390/aws-mfa-enforce)** <br/> Serverless function to automate enforcement of Multi-Factor Authentication (MFA) to all AWS IAM users with access to AWS Management Console. | [Chan9390](http://github.com/Chan9390) |
| **[Aws Node Signed Uploads](https://github.com/kalinchernev/aws-node-signed-uploads)** <br/> Upload files larger than 10MB with AWS Lambda and API Gateway. Can be developed and tested locally. | [kalinchernev](http://github.com/kalinchernev) |
| **[Aws Ses Serverless Example](https://github.com/lakshmantgld/aws-ses-serverless-example)** <br/> AWS SES example in NodeJS using lambda | [lakshmantgld](http://github.com/lakshmantgld) |
| **[Bablebot](https://github.com/abiglobalhealth/babelbot)** <br/> Lambda + API Gateway: Zero-to-chatbot in <10 lines of JS. Built-in integrations for Messenger, Telegram, Kik, Line, Twilio, Skype, and Wechat. Or roll your own! | [abiglobalhealth](http://github.com/abiglobalhealth) |
| **[Bittman](https://github.com/rhlsthrm/bittman)** <br/> A serverless project that follows a stock trading algorithm and uses scheduled functions to save data to DynamoDB and send emails through Mailgun. | [rhlsthrm](http://github.com/rhlsthrm) |
| **[Bref Laravel](https://github.com/brefphp/examples/tree/master/Laravel/base)** <br/> A serverless Laravel application running on AWS Lambda using Bref. | [brefphp](http://github.com/brefphp) |
| **[Bref Laravel Queues](https://github.com/brefphp/examples/tree/master/Laravel/queues)** <br/> Laravel Queues with SQS and AWS Lambda using Bref. | [brefphp](http://github.com/brefphp) |
| **[Cordis Serverless](https://github.com/marzeelabs/cordis-serverless)** <br/> A serverless API for EU Cordis data | [marzeelabs](http://github.com/marzeelabs) |
| **[Faultline](https://github.com/faultline/faultline)** <br/> Error tracking tool on AWS managed services. | [faultline](http://github.com/faultline) |
| **[Giphy Bot](https://github.com/tywong/lambda-workshop-2016/tree/master/giphy-bot)** <br/> giphy-bot for Facebook chat | [tywong](http://github.com/tywong) |
| **[Grants Api Serverless](https://github.com/comicrelief/grants-api-serverless)** <br/> ES6 API to consume data from an external API, ingest into Elasticsearch and return a queryable endpoint on top of Elasticsearch | [comicrelief](http://github.com/comicrelief) |
| **[Honeylambda](https://github.com/0x4D31/honeyLambda)** <br/> a simple, serverless application designed to create and monitor URL {honey}tokens, on top of AWS Lambda and Amazon API Gateway | [0x4D31](http://github.com/0x4D31) |
| **[Jrestless Examples](https://github.com/bbilger/jrestless-examples)** <br/> [JRestless](https://github.com/bbilger/jrestless) (Java / JAX-RS) examples for [API Gateway Functions](https://github.com/bbilger/jrestless-examples/tree/master/aws/gateway) ([plain JAX-RS](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-showcase), [Spring](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-spring), [binary data requests/responses](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-binary), [custom authorizers](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-security-custom-authorizer) and [Cognito User Pool authorizers](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-security-cognito-authorizer)), [SNS Functions](https://github.com/bbilger/jrestless-examples/blob/master/aws/sns/aws-sns-usage-example) (asynchronous communication between functions) and [Service Functions](https://github.com/bbilger/jrestless-examples/blob/master/aws/service/aws-service-usage-example) (synchronous HTTP-like communication between functions - transparent through Feign) | [bbilger](http://github.com/bbilger) |
| **[Jwt Lambda Python](https://github.com/mikaelmork/jwt-auth.serverless)** <br/> Minimal proof-of-concept implementation of JWT with Serverless / AWS Lambda | [mikaelmork](http://github.com/mikaelmork) |
| **[Jwtauthorizr](https://github.com/serverlessbuch/jwtAuthorizr)** <br/> Custom JWT Authorizer Lambda function for Amazon API Gateway with Bearer JWT | [serverlessbuch](http://github.com/serverlessbuch) |
| **[Keboola Developer Portal](https://github.com/keboola/developer-portal)** <br/> Keboola developer portal built with Serverless | [keboola](http://github.com/keboola) |
| **[Offset Trump](https://github.com/FLGMwt/offset-trump)** <br/> Single page app using Serverless (C# runtime) and S3 site hosting. Pledge to do a good thing for the next four years to offset the potential negative effects of the US Presidency | [FLGMwt](http://github.com/FLGMwt) |
| **[Owntracks Serverless](https://github.com/dschep/owntracks-serverless)** <br/> A serverless implementation of the OwnTracks HTTP backend | [dschep](http://github.com/dschep) |
| **[Pfs Email Serverless](https://github.com/SCPR/pfs-email-serverless)** <br/> This is a lambda function created by the serverless framework. It searches through members in our mongodb who have not been sent emails and sends them an email with their custom token to unlock the pledge free stream. It then marks those members off as already receiving the email. | [SCPR](http://github.com/SCPR) |
| **[Plaid Cashburndown Service](https://github.com/cplee/cashburndown-service)** <br/> Service for calculating cash burndown with plaid. Frontend code can be found here: https://github.com/cplee/cashburndown-site | [cplee](http://github.com/cplee) |
| **[Sc5 Serverless Boilerplate](https://github.com/SC5/sc5-serverless-boilerplate)** <br/> A boilerplate that contains setup for test-driven development | [SC5](http://github.com/SC5) |
| **[Serverless + Java Dynamodb Imlementation Example](https://github.com/igorbakman/java-lambda-dynamodb)** <br/>  example for java programmers that want to work with AWS-Lambda and DynamoDB | [igorbakman](http://github.com/igorbakman) |
| **[Serverless + Lambda Protobuf Responses](https://github.com/theburningmonk/lambda-protobuf-demo)** <br/> Demo using API Gateway and Lambda with Protocol Buffer | [theburningmonk](http://github.com/theburningmonk) |
| **[Serverless + Medium Text To Speech](https://github.com/RafalWilinski/serverless-medium-text-to-speech)** <br/> Serverless-based, text-to-speech service for Medium articles | [RafalWilinski](http://github.com/RafalWilinski) |
| **[Serverless Dotnet Boilerplate](https://github.com/pharindoko/serverlessDotNetSample)** <br/> A serverless starter solution for .NET Core, ready for local debugging in VS Code, HTTP Endpoint, etc. | [pharindoko](http://github.com/pharindoko) |
| **[Serverless Aws Rekognition Finpics](https://github.com/rgfindl/finpics)** <br/> Use AWS Rekognition to provide a faces search of finpics.com | [rgfindl](http://github.com/rgfindl) |
| **[Serverless Api Typescript Template](https://github.com/JoshuaToth/serverless-api-typescript-template)** <br/> A starter template for a Serverless API using Typescript and Jest | [JoshuaToth](http://github.com/JoshuaToth) |
| **[Serverless Blog To Podcast](https://github.com/SC5/serverless-blog-to-podcast)** <br/> Service that reads RSS feed and converts the entries to a podcast feed and audio files using Amazon Polly | [SC5](http://github.com/SC5) |
| **[Serverless Cloudwatch Rds Custom Metrics](https://github.com/AndrewFarley/serverless-cloudwatch-rds-custom-metrics)** <br/> A NodeJS-based MySQL RDS Data Collection script to push Custom Metrics to Cloudwatch with Serverless | [AndrewFarley](http://github.com/AndrewFarley) |
| **[Serverless Delivery Framework](https://github.com/99xt/serverless-delivery-framework)** <br/> This is a boilerplate for version release pipeline with serverless framework | [99xt](http://github.com/99xt) |
| **[Serverless Examples Cached Rds Ws](https://github.com/mugglmenzel/serverless-examples-cached-rds-ws)** <br/> A serverless framework example project that uses API Gateway, ElastiCache, and RDS PostgreSQL. | [mugglmenzel](http://github.com/mugglmenzel) |
| **[Serverless Facebook Quotebot](https://github.com/pmuens/quotebot)** <br/> 100% Serverless Facebook messenger chatbot which will respond with inspiring quotes | [pmuens](http://github.com/pmuens) |
| **[Serverless Garden Aid](https://github.com/garden-aid/web-bff)** <br/> IoT Garden Aid Backend | [garden-aid](http://github.com/garden-aid) |
| **[Serverless Graphql Api](https://github.com/boazdejong/serverless-graphql-api)** <br/> Serverless GraphQL API using Lambda and DynamoDB | [boazdejong](http://github.com/boazdejong) |
| **[Serverless Html Pdf](https://github.com/calvintychan/serverless-html-pdf)** <br/> Service that convert HTML to PDF using PhantomJS's rasterize example. | [calvintychan](http://github.com/calvintychan) |
| **[Serverless Image Manager](https://github.com/TylorShin/lambda-image-manager)** <br/> image upload / download with resizing. Used API gateway's binary support & serverless | [TylorShin](http://github.com/TylorShin) |
| **[Serverless Mailgun Slack](https://github.com/Marcus-L/serverless-mailgun-slack)** <br/> A Serverless function for posting to a Slack Webhook in response to a Mailgun route | [Marcus-L](http://github.com/Marcus-L) |
| **[Serverless Messenger Boilerplate](https://github.com/SC5/serverless-messenger-boilerplate)** <br/> Serverless messenger bot boilerplate | [SC5](http://github.com/SC5) |
| **[Serverless Modern Koa](https://github.com/barczaG/serverless-modern-koa)** <br/> Serverless modern koa starter kit | [barczaG](http://github.com/barczaG) |
| **[Serverless Msg Gateway](https://github.com/yonahforst/msg-gateway)** <br/> A messaging aggregator for kik, skype, twilio, telegram, & messenger. Send and receive messages in a standard format. | [yonahforst](http://github.com/yonahforst) |
| **[Serverless Newsletter Signup](https://github.com/dschep/serverless-newsletter-signup)** <br/> Saves user details into DynamoDB table. Required values are email, first_name and last_name. | [dschep](http://github.com/dschep) |
| **[Serverless Node Api Dynamodb Neo4j](https://github.com/noetix/serverless-node-api-dynamodb-neo4j)** <br/> Architecture example to stream DynamoDB data to a read-model using Neo4j | [noetix](http://github.com/noetix) |
| **[Serverless Npm Registry](https://github.com/craftship/yith)** <br/> Serverless private npm registry, proxy and cache. | [craftship](http://github.com/craftship) |
| **[Serverless Pokego](https://github.com/jch254/pokego-serverless)** <br/> Serverless-powered API to fetch nearby Pokemon Go data | [jch254](http://github.com/jch254) |
| **[Serverless Postgraphql](https://github.com/rentrop/serverless-postgraphql)** <br/> GraphQL endpoint for PostgreSQL using postgraphql | [rentrop](http://github.com/rentrop) |
| **[Serverless Python Rds Cron](https://github.com/caulagi/serverless-python-rds-cron)** <br/> A serverless python example that periodically removes entries from AWS RDS | [caulagi](http://github.com/caulagi) |
| **[Serverless Python Sample](https://github.com/bennybauer/serverless-python-sample)** <br/> A simple serverless python sample with REST API endpoints and dependencies | [bennybauer](http://github.com/bennybauer) |
| **[Serverless React Boilerplate](https://github.com/99xt/serverless-react-boilerplate)** <br/> A serverless react boilerplate for offline development | [99xt](http://github.com/99xt) |
| **[Serverless Screenshot](https://github.com/svdgraaf/serverless-screenshot)** <br/> Serverless Screenshot Service using PhantomJS | [svdgraaf](http://github.com/svdgraaf) |
| **[Serverless Slack Cron](https://github.com/ivanderbu2/serverless-slack-cron)** <br/> Lambda function which sends messages to Slack channel in regular intervals via cron trigger. | [ivanderbu2](http://github.com/ivanderbu2) |
| **[Serverless Slack Emojibot](https://github.com/markhobson/emojibot)** <br/> Serverless slack bot for emoji | [markhobson](http://github.com/markhobson) |
| **[Serverless Slack Trevorbot](https://github.com/conveyal/trevorbot)** <br/> Slack bot for info on where in the world is Trevor Gerhardt? | [conveyal](http://github.com/conveyal) |
| **[Serverless Url Shortener](https://github.com/aletheia/serverless-url-shortener)** <br/> A simple url-shortener, using Serverless framework | [aletheia](http://github.com/aletheia) |
| **[Serverless Weekly2pocket App](https://github.com/s0enke/weekly2pocket)** <br/> Serverless-powered API for sending posts to pocket app | [s0enke](http://github.com/s0enke) |
| **[Slack Signup Serverless](https://github.com/dzimine/slack-signup-serverless)** <br/> Serverless signup to Slack and more. Lambda with Python, StepFunctions, and Web front end. Python boilerplate included. | [dzimine](http://github.com/dzimine) |
| **[Sls Access Counter](https://github.com/takahashim/sls-access-counter)** <br/> Site visitor counter | [takahashim](http://github.com/takahashim) |
| **[Sls Form Mail](https://github.com/takahashim/sls-form-mail)** <br/> Send SNS email from form data | [takahashim](http://github.com/takahashim) |
| **[Vanity Stargazer](https://github.com/silvermullet/vanity-stargazer)** <br/> Github vanity-stargazer is a serverless application to handle posting Github new star gazers to Slack | [silvermullet](http://github.com/silvermullet) |
| **[Video Preview And Analysis Service](https://github.com/laardee/video-preview-and-analysis-service)** <br/> An event-driven service that generates labels using Amazon Rekognition and creates preview GIF animation from a video file. | [laardee](http://github.com/laardee) |
<!-- AUTO-GENERATED-CONTENT:END -->

## Contributing

We are happy to accept more examples from the community. 🎉

### Adding example code

1. Make sure your contribution matches the linting setup for this repo:

  Run the linting via

  ```bash
  npm run lint
  ```

2. Add a `package.json` file in your example with a `name`, `title` and `description`. The name should generally match your example's folder. Include any `dependencies` used.

3. Regenerate the README.md with the following command

  ```bash
  npm run docs
  ```

4. Open a new pull request with your example. ⚡️

### Adding a community example

We love hearing about projects happening in the community. Feel free to add your serverless project to our growing list.

1. Add `name`, `description` and `githubUrl` to the [community-examples.json](./community-examples.json) file. You can also optionally add a `title`, `language` and `platform`.

2. Open a new pull request with your example. ⚡️
