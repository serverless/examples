<br/>

<div align="center">
  <a aria-label="Serverless.com" href="https://serverless.com">Website</a>
  &nbsp;•&nbsp;
  <a aria-label="Serverless Framework Documentation" href="https://serverless.com/framework/docs/">Documentation</a>
  &nbsp;•&nbsp;
  <a aria-label="Serverless Inc Twitter" href="https://twitter.com/goserverless">X / Twitter</a>
  &nbsp;•&nbsp;
  <a aria-label="Serverless Framework Community Slack" href="https://join.slack.com/t/serverless-contrib/shared_invite/zt-2jpqamlep-SRbvbcFGDXmpEXErcL4WWQ">Community Slack</a>
  &nbsp;•&nbsp;
  <a aria-label="Serverless Framework Community Forum" href="https://forum.serverless.com">Forum</a>
</div>

<br/>
<br/>

![examples-hero](https://github.com/user-attachments/assets/83d9a859-a801-4abd-b812-c4498bb032c3)

# Serverless Examples

A collection of ready-to-deploy [Serverless Framework](https://github.com/serverless/serverless) services.

## Table of Contents

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand)
  generated w/ `npm run docs`
-->
<details>
<summary>Click to expand</summary>

- [Getting Started](#getting-started)
- [Examples](#examples)
- [Community Examples](#community-examples)
- [Contributing](#contributing)
  - [Adding example code](#adding-example-code)
  - [Adding a community example](#adding-a-community-example)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Getting Started

The fastest way to get started is installing the [Serverless Framework CLI](https://www.serverless.com/framework/docs/getting-started) (`npm install -g serverless`) and deploying one of the examples below. If you are new to serverless, we recommend getting started by creating an HTTP API Endpoint in [NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-simple-http-endpoint), [Python](https://github.com/serverless/examples/tree/v4/aws-python-simple-http-endpoint), [Java](https://github.com/serverless/examples/tree/v4/aws-java-simple-http-endpoint), or [Golang](https://github.com/serverless/examples/tree/v4/aws-golang-simple-http-endpoint).

## Examples

Each example contains a `README.md` with an explanation about the service and it's use cases.

**Have an example?** Submit a PR or [open an issue](https://github.com/serverless/examples/issues). ⚡️

To use one of these examples, run the `serverless` command and pick a starter from the interactive template menu, or grab any example directly:

```bash
git clone https://github.com/serverless/examples
cd examples/folder-name
serverless deploy
```

<!-- AUTO-GENERATED-CONTENT:START (SERVERLESS_EXAMPLE_TABLE) t generated w/ `npm run docs` -->
| Example | Runtime |
|:--- |:--- |
| [Dot Net REST API with DynamoDB](https://github.com/serverless/examples/tree/v4/aws-dotnet-rest-api-with-dynamodb) <br/> Setup a REST API w/ DynamoDB using .NET 10 | dotnet |
| [AWS FFmepg Layer](https://github.com/serverless/examples/tree/v4/aws-ffmpeg-layer) <br/> AWS FFmepg Layer & a service using it to create GIFs | nodeJS |
| [AWS Golang Auth](https://github.com/serverless/examples/tree/v4/aws-golang-auth-examples) <br/> This example shows you how to setup auth in front of a AWS Lambda function | golang |
| [Google map api](https://github.com/serverless/examples/tree/v4/aws-golang-googlemap) <br/> Serverless example using golang to hit google map api | golang |
| [HTTP GET and POST](https://github.com/serverless/examples/tree/v4/aws-golang-http-get-post) <br/> Boilerplate code for Golang with GET and POST example | golang |
| [Aws golang rest api with dynamodb](https://github.com/serverless/examples/tree/v4/aws-golang-rest-api-with-dynamodb) <br/> Boilerplate code for Golang CRUD Operations | golang |
| [AWS S3 Bucket Replicator in Golang](https://github.com/serverless/examples/tree/v4/aws-golang-s3-file-replicator) <br/> Boilerplate code for Golang with S3 object create event and replicator example | golang |
| [Golang Simple HTTP Endpoint](https://github.com/serverless/examples/tree/v4/aws-golang-simple-http-endpoint) <br/> This example demonstrates how to setup a simple HTTP endpoint in Go. | golang |
| [AWS Simple HTTP Endpoint example in Java](https://github.com/serverless/examples/tree/v4/aws-java-simple-http-endpoint) <br/> This example demonstrates how to setup a simple HTTP GET endpoint using Java. Once you ping it, it will reply with the current time. | java |
| [Multiple Runtimes in One Service](https://github.com/serverless/examples/tree/v4/aws-multiple-runtime) <br/> This example demonstrates how you can run multiple runtimes in AWS Lambda. | nodeJS |
| [AWS Serverless Alexa Skill example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-alexa-skill) <br/> This example demonstrates how to setup your own Alexa skill using AWS Lambdas. | nodeJS |
| [API Gateway Authorizer Function for Auth0 or AWS Cognito using RS256 JSON Web Key Sets tokens.](https://github.com/serverless/examples/tree/v4/aws-node-auth0-cognito-custom-authorizers-api) <br/> Authorize your API Gateway with either Auth0 or Cognito JWKS RS256 tokens. | nodeJS |
| [AWS API Gateway Custom Authorizer Function with Auth0 example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-auth0-custom-authorizers-api) <br/> This is an example of how to protect API endpoints with Auth0, JSON Web Tokens (jwt) and a custom authorizer lambda function. | nodeJS |
| [Dynamic Image Resizing API](https://github.com/serverless/examples/tree/v4/aws-node-dynamic-image-resizer) <br/> This example shows you how to setup a dynamic image resizer API | nodeJS |
| [DynamoDB Streams Processing to S3](https://github.com/serverless/examples/tree/v4/aws-node-dynamodb-stream-processing) <br/> This example shows you how to consume a DynamoDB Stream, transform records, and archive them to S3. | nodeJS |
| [AWS Storing Encrypted Secrets example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-env-variables-encrypted-in-a-file) <br/> This example demonstrates how to store secrets like API keys encrypted in your repository while providing them as environment variables to your AWS Lambda functions. | nodeJS |
| [AWS Serverless Environment Variables Usage example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-env-variables) <br/> This example demonstrates how to use environment variables for AWS Lambdas. | nodeJS |
| [Node Express API on AWS](https://github.com/serverless/examples/tree/v4/aws-node-express-api) <br/> This template demonstrates how to develop and deploy a simple Node Express API running on AWS Lambda using the Serverless Framework. | nodeJS |
| [Node Express API service backed by DynamoDB on AWS](https://github.com/serverless/examples/tree/v4/aws-node-express-dynamodb-api) <br/> This template demonstrates how to develop and deploy a simple Node Express API service backed by DynamoDB running on AWS Lambda using the Serverless Framework. | nodeJS |
| [AWS Fetch image from URL and upload to S3 example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-fetch-file-and-store-in-s3) <br/> This example display how to fetch an image from remote source (URL) and then upload this image to a S3 bucket. | nodeJS |
| [Serverless Github Check](https://github.com/serverless/examples/tree/v4/aws-node-github-check) <br/> The idea is to validate that all Pull Requests are related to a specific trello card. | nodeJS |
| [AWS Serverless Github Webhook Listener example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-github-webhook-listener) <br/> This service will listen to github webhooks fired by a given repository. | nodeJS |
| [GraphQL query endpoint in NodeJS on AWS with DynamoDB](https://github.com/serverless/examples/tree/v4/aws-node-graphql-api-with-dynamodb) <br/> A single-module GraphQL endpoint with query and mutation functionality. | nodeJS |
| [AWS Serverless IoT Event example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-iot-event) <br/> This example demonstrates how to setup a AWS IoT Rule to send events to a Lambda function. | nodeJS |
| [AWS MCP Server behind API Gateway REST (NodeJS)](https://github.com/serverless/examples/tree/v4/aws-mcp-servers/rest-api) <br/> Run an MCP server built with the official MCP TypeScript SDK on AWS Lambda, with streaming responses through API Gateway REST response streaming. | nodeJS |
| [AWS MCP Server on Lambda Function URL (NodeJS)](https://github.com/serverless/examples/tree/v4/aws-mcp-servers/function-url) <br/> Run an MCP server built with the official MCP TypeScript SDK on a Lambda Function URL with response streaming - no API Gateway. | nodeJS |
| [AWS MCP Server with Hono (NodeJS)](https://github.com/serverless/examples/tree/v4/aws-mcp-servers/hono) <br/> Run an MCP server on AWS Lambda with the official MCP Hono integration and Hono's aws-lambda adapter - no hand-written Lambda glue at all. | nodeJS |
| [AWS MCP Server with Express and Lambda Web Adapter (NodeJS)](https://github.com/serverless/examples/tree/v4/aws-mcp-servers/express-web-adapter) <br/> Run an MCP server as a plain Express app on AWS Lambda with Lambda Web Adapter - zip deployment, streaming through API Gateway REST. | nodeJS |
| [AWS MCP Server with Fastify in a Container Image (NodeJS)](https://github.com/serverless/examples/tree/v4/aws-mcp-servers/fastify-container) <br/> Run an MCP server as a containerized Fastify app on AWS Lambda with Lambda Web Adapter - the same image runs on Fargate or anywhere else. | nodeJS |
| [Node.js AWS Lambda connecting to MongoDB Atlas](https://github.com/serverless/examples/tree/v4/aws-node-mongodb-atlas) <br/> Shows how to connect AWS Lambda to MongoDB Atlas. | nodeJS |
| [Running Puppeteer on AWS Lambda](https://github.com/serverless/examples/tree/v4/aws-node-puppeteer) <br/> This example shows you how to run Puppeteer on AWS Lambda | nodeJS |
| [AWS Recursive Lambda function Invocation example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-recursive-function) <br/> This is an example of a function that will recursively call itself. | nodeJS |
| [AWS Analyse Image from S3 with Amazon Rekognition example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-rekognition-analysis-s3-image) <br/> This example shows how to analyze an image in an S3 bucket with Amazon Rekognition and return a list of labels. | nodeJS |
| [Serverless MongoDB Rest API with Mongoose and Bluebird Promises](https://github.com/serverless/examples/tree/v4/aws-node-rest-api-mongodb) <br/> This example demonstrate how to use MongoDB with AWS and Serverless. | nodeJS |
| [AWS Simple HTTP Endpoint example in NodeJS with Typescript](https://github.com/serverless/examples/tree/v4/aws-node-rest-api-typescript-simple) <br/> This template demonstrates how to make a simple REST API with Node.js and Typescript running on AWS Lambda and API Gateway using the Serverless Framework v1. | nodeJS |
| [Serverless Nodejs Rest API with TypeScript And MongoDB Atlas](https://github.com/serverless/examples/tree/v4/aws-node-rest-api-typescript) <br/> This is simple REST API example for AWS Lambda By Serverless framwork with TypeScript and MongoDB Atlas. | nodeJS |
| [AWS Serverless REST API with DynamoDB and offline support example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-rest-api-with-dynamodb-and-offline) <br/> This example demonstrates how to run a service locally, using the 'serverless-offline' plugin. It provides a REST API to manage Todos stored in DynamoDB. | nodeJS |
| [AWS Serverless REST API example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-rest-api-with-dynamodb) <br/> This example demonstrates how to setup a RESTful Web Service allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data. | nodeJS |
| [AWS Simple HTTP Endpoint example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-rest-api) <br/> This template demonstrates how to make a simple REST API with Node.js running on AWS Lambda and API Gateway using the traditional Serverless Framework. | nodeJS |
| [AWS Simple HTTP Endpoint example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-http-api) <br/> This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework. | nodeJS |
| [AWS Serverless HTTP API example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-http-api-dynamodb) <br/> This example demonstrates how to setup an HTTP API allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data. | nodeJS |
| [AWS Serverless HTTP API with DynamoDB and offline support example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-http-api-dynamodb-local) <br/> This example demonstrates how to run a service locally, using the 'serverless-offline' plugin. It provides an HTTP API to manage Todos stored in DynamoDB. | nodeJS |
| [Serverless MongoDB HTTP API with Mongoose and Bluebird Promises](https://github.com/serverless/examples/tree/v4/aws-node-http-api-mongodb) <br/> This example demonstrate how to use MongoDB with AWS and Serverless. | nodeJS |
| [AWS Simple HTTP Endpoint example in NodeJS with Typescript](https://github.com/serverless/examples/tree/v4/aws-node-http-api-typescript) <br/> This template demonstrates how to make a simple HTTP API with Node.js and Typescript running on AWS Lambda and API Gateway using the Serverless Framework v1. | nodeJS |
| [TypeScript Serverless HTTP API with DynamoDB](https://github.com/serverless/examples/tree/v4/aws-node-http-api-typescript-dynamodb) <br/> This example shows your how to create a TypeScript powered HTTP API with DynamoDB. | nodeJS |
| [AWS S3 File Replicator](https://github.com/serverless/examples/tree/v4/aws-node-s3-file-replicator) <br/> This example creates 2 AWS S3 buckets and copies files in one bucket to the other | nodeJS |
| [AWS Node Scheduled Cron example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-scheduled-cron) <br/> This is an example of creating a function that runs as a cron job using the serverless ''schedule'' event. | nodeJS |
| [AWS Lambda Self-Managed Code Storage](https://github.com/serverless/examples/tree/v4/aws-node-self-managed-code-storage) <br/> Run Lambda function and layer code directly from the deployment bucket with self-managed code storage | nodeJS |
| [AWS Serving Dynamic HTML via API Gateway example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-serve-dynamic-html-via-http-endpoint) <br/> This example illustrates how to hookup an API Gateway endpoint to a Lambda function to render HTML on a GET request. | nodeJS |
| [The Serverless Gong](https://github.com/serverless/examples/tree/v4/aws-node-serverless-gong) <br/> A serverless gong with GitHub and Slack webhooks | nodeJS |
| [AWS SES receive emails and process body](https://github.com/serverless/examples/tree/v4/aws-node-ses-receive-email-body) <br/> This example shows how to process receiving emails, and have S3 trigger a lambda function. | nodeJS |
| [AWS SES receive an email, trigger a lambda function to process header.](https://github.com/serverless/examples/tree/v4/aws-node-ses-receive-email-header) <br/> This example shows how to process receiving email header, and trigger a lambda function. | nodeJS |
| [Shared AWS API Gateway with multiple Node Lambdas](https://github.com/serverless/examples/tree/v4/aws-node-shared-gateway) <br/> A sample of implementing shared API gateway with multiple Node Lambdas | nodeJS |
| [AWS Node Signed Uploads](https://github.com/serverless/examples/tree/v4/aws-node-signed-uploads) <br/> The approach implemented in this service is useful when you want to use Amazon API Gateway and you want to solve the 10MB payload limit | nodeJS |
| [AWS Simple HTTP Endpoint example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-simple-http-endpoint) <br/> This example demonstrates how to setup a simple HTTP GET endpoint. Once you ping it, it will reply with the current time. | nodeJS |
| [Simple AWS Transcribe example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-simple-transcribe-s3) <br/> This example demonstrates how to setup a lambda function to transcribe your audio file (.wav format) into a text transcription. The lambda will be triggered whenever a new audio file is uploaded to S3 and the transcription (JSON format) will be saved to a S3 bucket. | nodeJS |
| [AWS Single Page Application example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-single-page-app-via-cloudfront) <br/> This example demonstrates how to setup a Single Page Application. | nodeJS |
| [Node SQS Producer Consumer on AWS](https://github.com/serverless/examples/tree/v4/aws-node-sqs-worker) <br/> This template demonstrates how to develop and deploy a simple SQS-based producer-consumer service running on AWS Lambda using the traditional Serverless Framework. | nodeJS |
| [AWS Stripe Integration example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-stripe-integration) <br/> This example for Stripe integration using AWS Lambda and API Gateway. | nodeJS |
| [Simple Telegram bot](https://github.com/serverless/examples/tree/v4/aws-node-telegram-echo-bot) <br/> This is a simple echo bot on Telegram. | nodeJS |
| [AWS Data Processing example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-text-analysis-via-sns-post-processing) <br/> This example demonstrates how to setup a simple data processing pipeline. | nodeJS |
| [AWS Send SMS Message with Twilio example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-twilio-send-text-message) <br/> This example demonstrates how to send SMS messages with the Twilio SDK and AWS lambda. | nodeJS |
| [AWS Apollo Lambda (NodeJS & Typescript)](https://github.com/serverless/examples/tree/v4/aws-node-typescript-apollo-lambda) <br/> This example provides a setup for a Lambda Graphql API with apollo | nodeJS |
| [AWS Kinesis Data Streams Example (NodeJS & Typescript)](https://github.com/serverless/examples/tree/v4/aws-node-typescript-kinesis) <br/> Produce and Consume data on a Kinesis Data Stream with Typescript. | nodeJS |
| [AWS Nest application example (NodeJS & Typescript)](https://github.com/serverless/examples/tree/v4/aws-node-typescript-nest) <br/> This example demonstrates how to setup a simple [Nest](https://github.com/nestjs/nest) application. | nodeJS |
| [TypeScript Serverless REST API with DynamoDB](https://github.com/serverless/examples/tree/v4/aws-node-typescript-rest-api-with-dynamodb) <br/> This example shows your how to create a TypeScript powered REST API with DynamoDB. | nodeJS |
| [AWS SQS Standard Example (NodeJS & Typescript)](https://github.com/serverless/examples/tree/v4/aws-node-typescript-sqs-standard) <br/> This example demonstrates how to setup a SQS with Typescript. | nodeJS |
| [AWS Upload a file to S3 to trigger a Lambda function example in NodeJS](https://github.com/serverless/examples/tree/v4/aws-node-upload-to-s3-and-postprocess) <br/> This example shows how to upload a file to S3 using a HTML form, and have S3 trigger a lambda function. | nodeJS |
| [Simple Websocket Authorizers](https://github.com/serverless/examples/tree/v4/aws-node-websockets-authorizers) <br/> The example shows you how to deploy simple websocket authorizers | nodeJS |
| [AWS NodeJS Example](https://github.com/serverless/examples/tree/v4/aws-node) <br/> This template demonstrates how to deploy a simple NodeJS function running on AWS Lambda using the Serverless Framework. | nodeJS |
| [AWS Serverless Alexa Skill example in Python](https://github.com/serverless/examples/tree/v4/aws-python-alexa-skill) <br/> This example demonstrates how to setup your own Alexa skill using AWS Lambdas. | python |
| [AWS API Gateway Custom Authorizer Function with Auth0 example in Python](https://github.com/serverless/examples/tree/v4/aws-python-auth0-custom-authorizers-api) <br/> This is an example of how to protect API endpoints with Auth0, JSON Web Tokens (jwt) and a custom authorizer lambda function in Python 3. | python |
| [Python Flask API on AWS](https://github.com/serverless/examples/tree/v4/aws-python-flask-api) <br/> This template demonstrates how to develop and deploy a simple Python Flask API running on AWS Lambda using the Serverless Framework. | python |
| [Python Flask API backed by DynamoDB on AWS](https://github.com/serverless/examples/tree/v4/aws-python-flask-dynamodb-api) <br/> This template demonstrates how to develop and deploy a simple Python Flask API service backed by DynamoDB running on AWS Lambda using the Serverless Framework. | python |
| [Simple LINE bot](https://github.com/serverless/examples/tree/v4/aws-python-line-echo-bot) <br/> This is a simple echo bot on LINE bot. | python |
| [AWS Serverless REST API with DynamoDB store and presigned URLs example in Python 3.6.](https://github.com/serverless/examples/tree/v4/aws-python-pynamodb-s3-sigurl) <br/> This example demonstrates how to setup a RESTful Web Service allowing you to create, list, get, update and delete Assets. DynamoDB is used to store the data. | python |
| [AWS Serverless REST API with DynamoDB store example in Python](https://github.com/serverless/examples/tree/v4/aws-python-rest-api-with-dynamodb) <br/> This example demonstrates how to setup a RESTful Web Service allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data. | python |
| [AWS Python Rest API with Pymongo](https://github.com/serverless/examples/tree/v4/aws-python-rest-api-with-pymongo) <br/> AWS Python Rest API with Pymongo Example | python |
| [AWS Serverless REST API with DynamoDB store example in Python](https://github.com/serverless/examples/tree/v4/aws-python-rest-api-with-pynamodb) <br/> This example demonstrates how to setup a RESTful Web Service allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data. | python |
| [AWS Simple HTTP Endpoint example in Python](https://github.com/serverless/examples/tree/v4/aws-python-rest-api) <br/> This template demonstrates how to make a simple REST API with Python running on AWS Lambda and API Gateway using the traditional Serverless Framework. | python |
| [AWS Simple HTTP Endpoint example in Python](https://github.com/serverless/examples/tree/v4/aws-python-http-api) <br/> This template demonstrates how to make a simple HTTP API with Python running on AWS Lambda and API Gateway using the Serverless Framework. | python |
| [AWS Serverless HTTP API with DynamoDB store example in Python](https://github.com/serverless/examples/tree/v4/aws-python-http-api-with-dynamodb) <br/> This example demonstrates how to setup an HTTP API allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data. | python |
| [AWS Serverless HTTP API with DynamoDB store example in Python](https://github.com/serverless/examples/tree/v4/aws-python-http-api-with-pynamodb) <br/> This example demonstrates how to setup an HTTP API allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data. | python |
| [AWS Python Scheduled Cron example in Python](https://github.com/serverless/examples/tree/v4/aws-python-scheduled-cron) <br/> This is an example of creating a function that runs as a cron job using the serverless ''schedule'' event. | python |
| [AWS Simple HTTP Endpoint example in Python](https://github.com/serverless/examples/tree/v4/aws-python-simple-http-endpoint) <br/> This example demonstrates how to setup a simple HTTP GET endpoint. Once you ping it, it will reply with the current time. | python |
| [Python SQS Producer Consumer on AWS](https://github.com/serverless/examples/tree/v4/aws-python-sqs-worker) <br/> This template demonstrates how to develop and deploy a simple SQS-based producer-consumer service running on AWS Lambda using the traditional Serverless Framework. | python |
| [Python Telegram Bot](https://github.com/serverless/examples/tree/v4/aws-python-telegram-bot) <br/> This example demonstrates how to setup an echo Telegram Bot using the Serverless Framework. | python |
| [AWS Python Example](https://github.com/serverless/examples/tree/v4/aws-python) <br/> This template demonstrates how to deploy a Python function running on AWS Lambda using the Serverless Framework. | python |
| [Ruby LINE bot](https://github.com/serverless/examples/tree/v4/aws-ruby-line-bot) <br/> This example shows you how to create a LINE bot using Ruby. | ruby |
| [AWS Simple HTTP Endpoint example in Ruby](https://github.com/serverless/examples/tree/v4/aws-ruby-simple-http-endpoint) <br/> This example demonstrates how to setup a simple HTTP GET endpoint. Once you ping it, it will reply with the current time. | ruby |
| [Ruby Sinatra API backed by DynamoDB on AWS](https://github.com/serverless/examples/tree/v4/aws-ruby-sinatra-dynamodb-api) <br/> This template demonstrates how to develop and deploy a simple Ruby Sinatra API service backed by DynamoDB running on AWS Lambda using the traditional Serverless Framework. | ruby |
| [AWS Ruby scheduled cron example backed by DynamoDB](https://github.com/serverless/examples/tree/v4/aws-ruby-cron-with-dynamodb) <br/> This is an example of creating a function that runs as a cron job using the serverless 'schedule' event. With the usage of the AWS Lambda function, it creates a record to the DynamoDB each and every 30 minutes. | ruby |
| [AWS Ruby Step Functions](https://github.com/serverless/examples/tree/v4/aws-ruby-step-functions) <br/> AWS Ruby example that make usage of AWS Step Functions with AWS Lambda, DynamoDB and Step Functions flows. | ruby |
| [AWS Ruby Step Functions Express](https://github.com/serverless/examples/tree/v4/aws-ruby-step-functions-express) <br/> Ruby example that make usage of AWS Step Functions Express Type with AWS Lambda, DynamoDB, Amazon SES, API Gateway, and Step Functions flows. | ruby |
| [AWS Ruby Step Functions with Callback](https://github.com/serverless/examples/tree/v4/aws-ruby-step-functions-with-callback) <br/> Ruby example that make usage of AWS Step Functions with callback pattern, AWS Lambda, DynamoDB, Amazon Comprehend, API Gateway, and Step Functions flows. | ruby |
| [Serverless AWS Ruby SQS with DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-ruby-sqs-with-dynamodb) <br/> A serverless ruby example that creates DynamoDB records with the usage of SQS, API Gateway, and AWS Lambda functions. | ruby |
| [AWS Serverless Boilerplate example in Rust](https://github.com/serverless/examples/tree/v4/aws-rust-simple-http-endpoint) <br/> This example shows a Serverless boilerplate in Rust. | rust |
| [Serverless Framework Sandboxes: Complete AWS Lambda MicroVM Example](https://github.com/serverless/examples/tree/v4/sandboxes/complete) <br/> Deploy-as-is showcase of every sandboxes property: Dockerfile build, memory, hooks, observability, IAM, and tags. | nodeJS |
| [Serverless Framework Sandboxes: Minimal AWS Lambda MicroVM Example](https://github.com/serverless/examples/tree/v4/sandboxes/minimal) <br/> Smallest possible sandboxes configuration, using only the required artifact field and framework defaults. | nodeJS |
| [Serverless Framework Sandboxes: Self-Hosted Webhook for Claude Managed Agents](https://github.com/serverless/examples/tree/v4/sandboxes/self-hosted-webhook) <br/> Self-hosted AWS Lambda MicroVM sandbox per Claude Managed Agent session, launched on demand by a webhook. | nodeJS |
| [Bedrock AgentCore: LangGraph Basic Agent, Code Deploy (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-basic) <br/> Minimal LangGraph JS agent built automatically from source with no Dockerfile, deployed to AWS Bedrock AgentCore. | nodeJS |
| [Bedrock AgentCore: LangGraph Basic Agent, Dockerfile Deploy (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-basic-dockerfile) <br/> Minimal LangGraph JS agent deployed to AWS Bedrock AgentCore via a custom Dockerfile build. | nodeJS |
| [Bedrock AgentCore: LangGraph Agent with Managed Browser (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-browser) <br/> LangGraph JS agent using the AWS-managed AgentCore Browser tool for web navigation and screenshots. | nodeJS |
| [Bedrock AgentCore: LangGraph Agent with Custom Browser (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-browser-custom) <br/> LangGraph JS agent using a custom AgentCore Browser resource with session recording to S3. | nodeJS |
| [Bedrock AgentCore: LangGraph Agent with Managed Code Interpreter (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-code-interpreter) <br/> LangGraph JS agent using the AWS-managed AgentCore Code Interpreter for sandboxed code execution. | nodeJS |
| [Bedrock AgentCore: LangGraph Agent with Custom Code Interpreter (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-code-interpreter-custom) <br/> LangGraph JS agent using a custom AgentCore Code Interpreter with PUBLIC network access. | nodeJS |
| [Bedrock AgentCore: LangGraph Comprehensive Agent (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-comprehensive) <br/> LangGraph JS agent combining Gateway tools, a direct MCP connection, browser, code interpreter, and memory in one deployment. | nodeJS |
| [Bedrock AgentCore: LangGraph Agent with Gateway Tools (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-gateway) <br/> LangGraph JS agent exposing Lambda-backed tools through an AgentCore Gateway over MCP. | nodeJS |
| [Bedrock AgentCore: LangGraph Agent with Memory (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-memory) <br/> LangGraph JS agent using AgentCore Memory to persist and recall conversation history. | nodeJS |
| [Bedrock AgentCore: LangGraph Multi-Gateway Agents (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-multi-gateway) <br/> LangGraph JS agents using separate public and private AgentCore Gateways with different authorization levels. | nodeJS |
| [Bedrock AgentCore: LangGraph Agent with Token Streaming (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-streaming) <br/> LangGraph JS agent streaming LLM tokens in real time over SSE via BedrockAgentCoreApp. | nodeJS |
| [Bedrock AgentCore: Standalone MCP Server (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/mcp-server) <br/> Standalone JavaScript MCP server deployed to AWS Bedrock AgentCore Runtime, consumable by any MCP client. | nodeJS |
| [Bedrock AgentCore: MCP Server from Plain Lambda Functions (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/mcp-server-lambda-tools) <br/> MCP server whose tools are plain Lambda functions - no MCP SDK in your code - using Bedrock AgentCore Gateway. | nodeJS |
| [Bedrock AgentCore: Strands Agent with Browser (JavaScript)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/strands-browser) <br/> Strands Agents JavaScript agent using AgentCore Browser tools for web automation. | nodeJS |
| [Bedrock AgentCore: LangGraph Basic Agent, Code Deploy (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-basic-code) <br/> Minimal LangGraph agent deployed to AWS Bedrock AgentCore using code (zip) deployment. | python |
| [Bedrock AgentCore: LangGraph Basic Agent, Docker Deploy (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-basic-docker) <br/> Minimal LangGraph agent deployed to AWS Bedrock AgentCore using Docker/container deployment. | python |
| [Bedrock AgentCore: LangGraph Agent with Managed Browser (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-browser) <br/> LangGraph agent using AgentCore Browser via LangChain's browser toolkit for web automation. | python |
| [Bedrock AgentCore: LangGraph Agent with Custom Browser (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-browser-custom) <br/> LangGraph agent using a custom AgentCore Browser resource with session recording to S3. | python |
| [Bedrock AgentCore: LangGraph Agent with Managed Code Interpreter (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-code-interpreter) <br/> LangGraph agent using the AWS-managed AgentCore Code Interpreter (SANDBOX mode) for Python execution. | python |
| [Bedrock AgentCore: LangGraph Agent with Custom Code Interpreter (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-code-interpreter-custom) <br/> LangGraph agent using a custom AgentCore Code Interpreter with PUBLIC network mode. | python |
| [Bedrock AgentCore: LangGraph Agent with Gateway Tools (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-gateway) <br/> LangGraph agent exposing custom Lambda function tools via an auto-created AgentCore Gateway. | python |
| [Bedrock AgentCore: LangGraph Agent with Memory (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-memory) <br/> LangGraph agent using AgentCore Memory as a tool for recalling and saving conversation history. | python |
| [Bedrock AgentCore: LangGraph Multi-Gateway Agents (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-multi-gateway) <br/> LangGraph agent using multiple AgentCore Gateways with different authorization types and tool subsets. | python |
| [Bedrock AgentCore: Strands Agent with Browser (Python)](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/strands-browser) <br/> Strands Agents agent using AgentCore Browser for web automation and research tasks. | python |
| [Serverless Compose of Serverless, Cloudformation, and SAM](https://github.com/serverless/examples/tree/v4/compose-multiframework) <br/> This template shows how to compose multiple services using different frameworks, in a single project | nodeJS |
<!-- AUTO-GENERATED-CONTENT:END -->

## Community Examples

Examples maintained by the community in their own repositories.

<!-- AUTO-GENERATED-CONTENT:START (COMMUNITY_EXAMPLES_TABLE) generated w/ `npm run docs` -->
| Example | Runtime |
|:--- |:--- |
| [Serverless Lambda S3 Demonstration](https://github.com/johncmunson/serverless-lambda-s3) <br/> This project demonstrates how the Serverless Framework can be used to deploy a NodeJS Lambda function that responds to events in an S3 bucket. | nodeJS |
| [Spiderless, Web Spider on Serverless](https://github.com/slashbit/spider-less) <br/> A web spider / scraper / website change detector built with Lambda, API Gateway, DynamoDB and SNS | nodeJS |
| [AWS Demo Java Spring Cloud Function Serverless](https://github.com/mbsambangi/aws-java-spring-cloud-function-demo) <br/> If Java is your choice of programming language-Spring Cloud Function,Serverless Framework makes a great technology stack. It boosts developer productivity by decoupling from Vendor specific FaaS API, and deployment activities. | java |
| [Serverless Architecture Boilerplate](https://github.com/msfidelis/serverless-architecture-boilerplate) <br/> Boilerplate to organize and deploy big projects using Serverless and CloudFormation on AWS | nodeJS |
| [JwtAuthorizr](https://github.com/serverlessbuch/jwtAuthorizr) <br/> Custom JWT Authorizer Lambda function for Amazon API Gateway with Bearer JWT | nodeJS |
| [Slack signup serverless](https://github.com/dzimine/slack-signup-serverless) <br/> Serverless signup to Slack and more. Lambda with Python, StepFunctions, and Web front end. Python boilerplate included. | python |
| [Serverless graphql api](https://github.com/boazdejong/serverless-graphql-api) <br/> Serverless GraphQL API using Lambda and DynamoDB | nodeJS |
| [Serverless screenshot](https://github.com/svdgraaf/serverless-screenshot) <br/> Serverless Screenshot Service using PhantomJS | nodeJS |
| [Serverless postgraphql](https://github.com/rentrop/serverless-postgraphql) <br/> GraphQL endpoint for PostgreSQL using postgraphql | nodeJS |
| [Serverless messenger boilerplate](https://github.com/SC5/serverless-messenger-boilerplate) <br/> Serverless messenger bot boilerplate | nodeJS |
| [Serverless npm registry](https://github.com/craftship/yith) <br/> Serverless private npm registry, proxy and cache. | nodeJS |
| [Serverless facebook quotebot](https://github.com/pmuens/quotebot) <br/> 100% Serverless Facebook messenger chatbot which will respond with inspiring quotes | nodeJS |
| [Serverless slack trevorbot](https://github.com/conveyal/trevorbot) <br/> Slack bot for info on where in the world is Trevor Gerhardt? | nodeJS |
| [Pfs email serverless](https://github.com/SCPR/pfs-email-serverless) <br/> This is a lambda function created by the serverless framework. It searches through members in our mongodb who have not been sent emails and sends them an email with their custom token to unlock the pledge free stream. It then marks those members off as already receiving the email. | nodeJS |
| [Plaid cashburndown service](https://github.com/cplee/cashburndown-service) <br/> Service for calculating cash burndown with plaid. Frontend code can be found here: https://github.com/cplee/cashburndown-site | nodeJS |
| [Cordis serverless](https://github.com/marzeelabs/cordis-serverless) <br/> A serverless API for EU Cordis data | nodeJS |
| [Serverless newsletter signup](https://github.com/dschep/serverless-newsletter-signup) <br/> Saves user details into DynamoDB table. Required values are email, first_name and last_name. | nodeJS |
| [Serverless slack cron](https://github.com/ivanderbu2/serverless-slack-cron) <br/> Lambda function which sends messages to Slack channel in regular intervals via cron trigger. | nodeJS |
| [Sls access counter](https://github.com/takahashim/sls-access-counter) <br/> Site visitor counter | nodeJS |
| [Sls form mail](https://github.com/takahashim/sls-form-mail) <br/> Send SNS email from form data | nodeJS |
| [Serverless python sample](https://github.com/bennybauer/serverless-python-sample) <br/> A simple serverless python sample with REST API endpoints and dependencies | python |
| [Serverless slack emojibot](https://github.com/markhobson/emojibot) <br/> Serverless slack bot for emoji | nodeJS |
| [Serverless cloudwatch rds custom metrics](https://github.com/AndrewFarley/serverless-cloudwatch-rds-custom-metrics) <br/> A NodeJS-based MySQL RDS Data Collection script to push Custom Metrics to Cloudwatch with Serverless | nodeJS |
| [Sc5 serverless boilerplate](https://github.com/SC5/sc5-serverless-boilerplate) <br/> A boilerplate that contains setup for test-driven development | nodeJS |
| [Serverless blog to podcast](https://github.com/SC5/serverless-blog-to-podcast) <br/> Service that reads RSS feed and converts the entries to a podcast feed and audio files using Amazon Polly | nodeJS |
| [Serverless url shortener](https://github.com/aletheia/serverless-url-shortener) <br/> A simple url-shortener, using Serverless framework | nodeJS |
| [Serverless html pdf](https://github.com/calvintychan/serverless-html-pdf) <br/> Service that convert HTML to PDF using PhantomJS's rasterize example. | nodeJS |
| [Serverless examples cached rds ws](https://github.com/mugglmenzel/serverless-examples-cached-rds-ws) <br/> A serverless framework example project that uses API Gateway, ElastiCache, and RDS PostgreSQL. | java |
| [Bittman](https://github.com/rhlsthrm/bittman) <br/> A serverless project that follows a stock trading algorithm and uses scheduled functions to save data to DynamoDB and send emails through Mailgun. | nodeJS |
| [Adoptable pet bot](https://github.com/lynnaloo/adoptable-pet-bot) <br/> Tweets adoptable pets using Serverless (Node.js) and AWS Lambda | nodeJS |
| [Owntracks serverless](https://github.com/dschep/owntracks-serverless) <br/> A serverless implementation of the OwnTracks HTTP backend | nodeJS |
| [Serverless ReactJS Universal Rendering Boilerplate](https://github.com/TylorShin/react-universal-in-serverless) <br/> ReactJS web app Starter kit does universal (isomorphic) rendering with Serverless | nodeJS |
| [Open Bot](https://github.com/open-bot/open-bot) <br/> An unoptionated Github bot driven by a configuration file in the repository | nodeJS |
| [Aws ses serverless example](https://github.com/lakshmantgld/aws-ses-serverless-example) <br/> AWS SES example in NodeJS using lambda | nodeJS |
| [SQS Worker with AWS Lambda and CloudWatch Alarms](https://github.com/sbstjn/sqs-worker-serverless) <br/> Process messages stored in SQS with an [auto-scaled AWS Lambda worker](https://sbstjn.com/serverless-sqs-worker-with-aws-lambda.html) function. | nodeJS |
| [Serverless image manager](https://github.com/TylorShin/lambda-image-manager) <br/> image upload / download with resizing. Used API gateway's binary support & serverless | nodeJS |
| [Amazon Kinesis Streams fan out via Kinesis Analytics](https://github.com/alexcasalboni/kinesis-streams-fan-out-kinesis-analytics) <br/> Use Amazon Kinesis Analytics to fan-out your Kinesis Streams and avoid read throttling. | nodeJS |
| [HoneyLambda](https://github.com/0x4D31/honeyLambda) <br/> a simple, serverless application designed to create and monitor URL {honey}tokens, on top of AWS Lambda and Amazon API Gateway | python |
| [Faultline](https://github.com/faultline/faultline) <br/> Error tracking tool on AWS managed services. | nodeJS |
| [Stack Overflow Monitor](https://github.com/picsoung/stackoverflowmonitor) <br/> Monitor Stack Overflow questions and post them in a Slack channel | nodeJS |
| [Serverless Analytics](https://github.com/sbstjn/serverless-analytics) <br/> Write your own Google Analytics clone and track website visitors serverless with API Gateway, Kinesis, Lambda, and DynamoDB. | nodeJS |
| [Serverless + medium text to speech](https://github.com/RafalWilinski/serverless-medium-text-to-speech) <br/> Serverless-based, text-to-speech service for Medium articles | nodeJS |
| [Serverless + java DynamoDB imlementation example](https://github.com/igorbakman/java-lambda-dynamodb) <br/>  example for java programmers that want to work with AWS-Lambda and DynamoDB | java |
| [AWS Cognito Custom User Pool Example](https://github.com/bsdkurt/aws-node-custom-user-pool) <br/> Example CloudFormation custom resource backed by a lambda using Cognito User Pools | nodeJS |
| [AWS Lambda, Amazon API Gateway, S3, DynamoDB and Cognito Example](https://github.com/andreivmaksimov/serverless-framework-aws-lambda-amazon-api-gateway-s3-dynamodb-and-cognito) <br/> Step by step guide how to deploy simple web application on top of AWS Lambda, Amazon API Gateway, S3, DynamoDB and Cognito. | nodeJS |
| [Run your Kubernetes Workloads on Amazon EC2 Spot Instances with Amazon EKS and Lambda   Part 1](https://github.com/andreivmaksimov/aws-eks-spot-instances-serverless-framework-demo) <br/> From this tutorial you'll learn how to add AWS EKS Cluster with Spot Instances to your cloud environment managed by Serverless framework | python |
| [Serverless + lambda protobuf responses](https://github.com/theburningmonk/lambda-protobuf-demo) <br/> Demo using API Gateway and Lambda with Protocol Buffer | nodeJS |
| [Serverless + lambda + vpc + nat + redis](https://github.com/ittus/aws-lambda-vpc-nat-examples) <br/> Demo using API Gateway and Lambda with VPC and NAT to access Internet and AWS Resource | nodeJS |
| [Serverless Gitlab CI](https://github.com/bvincent1/serverless-gitlab-ci) <br/> Simple Gitlab CI template for automatic testing and deployments | nodeJS |
| [Realtime WW2 Alexa Skill](https://github.com/ceilfors/realtime-ww2-alexa) <br/> An alexa skill project that's using Alexa SDK. Can also be used for a working example of serverless-webpack (with use of async/await via babel). | nodeJS |
| [Serverless Kakao Bot](https://github.com/JisuPark/serverless-kakao-bot) <br/> Easy development for Kakaotalk Bot with Serverless | nodeJS |
| [Personal Access Tokens Cron Check](https://github.com/madtrick/cfpat-audit) <br/> Audit for leaked PAT in your Contentful organization. How to use serverless as cronjobs to keep your Personal Access Tokens secure | nodeJS |
| [Daily Instance Backups with AMI Rotation](https://github.com/AndrewFarley/AWSAutomatedDailyInstanceAMISnapshots) <br/> A simple Python application which scans through your entire AWS account for tagged instances, makes daily AMIs of them, and rotates their backups automatically | python |
| [Serverless Instagram Crawler](https://github.com/kimcoder/serverless-instagram-crawler) <br/> Instagram hashtag Crawler with Lambda & DynamoDB. | nodeJS |
| [Serverless Next.js Example](https://github.com/kimcoder/serverless-nextjs) <br/> Next.js example project for development & deploy. | nodeJS |
| [Serving binary files](https://github.com/thomastoye/serverless-binary-files-xlsx) <br/> Small example showing how to serve binary files using Serverless on AWS with the serverless-apigw-binary plugin, using generated Excel files as an example | nodeJS |
| [Lambda PubSub via SNS Example](https://github.com/didil/serverless-lambda-sns-example) <br/> Example illustrating the flow: Lambda (publisher) => SNS => Lambda (consumer) | nodeJS |
| [Serverless CloudWatch Proxy](https://github.com/abbasdgr8/cloudwatch-proxy) <br/> Logging adapter that consumes log streams from AWS CloudWatch, streams them to other log destinations. Also capable of identying alerts and sending notifications via Slack/Email | python |
| [Serverless side rendering with Vue.js and Nuxt.js](https://github.com/adnanrahic/serverless-side-rendering-vue-nuxt) <br/> Sample project for using Nuxt.js to create a server-side rendered Vue.js app on AWS Lambda and AWS API Gateway. Can easily integrate with your own API or 3rd party APIs such as headless CMS, e-commerce or serverless architecture. | nodeJS |
| [Aws mfa enforce](https://github.com/Chan9390/aws-mfa-enforce) <br/> Serverless function to automate enforcement of Multi-Factor Authentication (MFA) to all AWS IAM users with access to AWS Management Console. | nodeJS |
| [Vanity stargazer](https://github.com/silvermullet/vanity-stargazer) <br/> Github vanity-stargazer is a serverless application to handle posting Github new star gazers to Slack | python |
| [Fotopia Serverless](https://github.com/mbudm/fotopia-serverless) <br/> A photo archive web app including API, storage and face detection using serverless framework | nodeJS |
| [Commenting API](https://github.com/AyoubEd/serverless_typescript_graphQl_commentingService) <br/> A commenting api using Serverless Typescript GraphQl and Redis | nodeJS |
| [Serverless node api dynamodb neo4j](https://github.com/noetix/serverless-node-api-dynamodb-neo4j) <br/> Architecture example to stream DynamoDB data to a read-model using Neo4j | nodeJS |
| [Serverless python rds cron](https://github.com/caulagi/serverless-python-rds-cron) <br/> A serverless python example that periodically removes entries from AWS RDS | python |
| [Nietzsche](https://github.com/rpidanny/Nietzsche) <br/> A serverless application that fetches quotes from Goodreads and saves it to DynamoDB with example use cases using `Lambda`, `SNS`, `SQS`, `Step Functions`, `DynamoDB`, `API Gateway`, `CloudWatch` | nodeJS |
| [Serverless DotNet BoilerPlate](https://github.com/pharindoko/serverlessDotNetSample) <br/> A serverless starter solution for .NET Core, ready for local debugging in VS Code, HTTP Endpoint, etc. | dotnet |
| [Serverless Load Balancer](https://github.com/pharindoko/serverless-load-balancer) <br/> A sample that shows how to combine a load balancer with (vpc/subnet configuration) with a lambda. | nodeJS |
| [Serverless api typescript template](https://github.com/JoshuaToth/serverless-api-typescript-template) <br/> A starter template for a Serverless API using Typescript and Jest | nodeJS |
| [Serverless SNS SQS offline Example ](https://github.com/kenyipp/serverless-sns-sqs-offline-example) <br/> Minimal example of running serverless-offline with SQS and SNS in local environment. | nodeJS |
| [Serverless RDS Log Sync S3](https://github.com/drocco007/serverless-aws-rds-logs-s3) <br/> Annotated exmaple of a periodic scheduled task to sync changed RDS log files to an S3 bucket. | python |
| [Serverless Image Labeller](https://github.com/nileshprasad137/serverless-image-labeller) <br/> Serverless image labelling using Rekognition, s3, DynamoDB. | python |
| [Serverless AppSync offline TypeScript with CircleCI](https://github.com/daisuke-awaji/serverless-appsync-offline-typescript-template) <br/> A Serverless Framework template that allows you to launch an AppSync emulator locally and proceed with development. Lambda Function build by TypeScript/Webpack. | nodeJS |
| [Serverless Screenshot to S3](https://github.com/slaytr/aws-node-screenshot-to-s3) <br/> An example serverless stack which takes a screenshot using aws-chrome-lambda and puts it in s3. NodeJS. | nodeJS |
| [Express Application With Lambda](https://github.com/HoseungJang/serverless-lambda-express-example) <br/> This example demonstrates how to build an express application for AWS Lambda based on serverless framework. | nodeJS |
| [DropBucket - Serverless file sharing](https://github.com/marksteele/drop-bucket) <br/> A serverless file sharing app powered by Cognito/S3/Lambda/API Gateway. Includes a React single-page app UI and virus scanning. | nodeJS |
| [serverless-react-boilerplate](https://github.com/99xt/serverless-react-boilerplate) <br/> A serverless react boilerplate for offline development | nodeJS |
| [serverless-delivery-framework](https://github.com/99xt/serverless-delivery-framework) <br/> This is a boilerplate for version release pipeline with serverless framework | nodeJS |
| [serverless-mailgun-slack](https://github.com/Marcus-L/serverless-mailgun-slack) <br/> A Serverless function for posting to a Slack Webhook in response to a Mailgun route | nodeJS |
| [serverless-AWS-Rekognition-finpics](https://github.com/rgfindl/finpics) <br/> Use AWS Rekognition to provide a faces search of finpics.com | nodeJS |
| [jrestless-examples](https://github.com/bbilger/jrestless-examples) <br/> JRestless (Java / JAX-RS) examples for API Gateway Functions (plain JAX-RS), Spring, binary data requests/responses, custom authorizers and Cognito User Pool authorizers), SNS Functions) (asynchronous communication between functions) and Service Functions) (synchronous HTTP-like communication between functions - transparent through Feign) | java |
| [AWS API Gateway Serverless project written in Go](https://github.com/yunspace/serverless-golang) <br/> A serverless project that contains an API Gateway endpoint powered by a Lambda function written in golang and built using [eawsy/aws-lambda-go-shim](https://github.com/eawsy/aws-lambda-go-shim). | golang |
| [video-preview-and-analysis-service](https://github.com/laardee/video-preview-and-analysis-service) <br/> An event-driven service that generates labels using Amazon Rekognition and creates preview GIF animation from a video file. | nodeJS |
| [Serverless ES6/7 CRUD API](https://github.com/AnomalyInnovations/serverless-stack-demo-api) <br/> Serverless Stack examples of backend CRUD APIs (DynamoDB + Lambda + API Gateway + Cognito User Pool authorizer) for React.js single-page app | nodeJS |
| [AWS Lambda Power Tuning (powered by Step Functions)](https://github.com/alexcasalboni/aws-lambda-power-tuning) <br/> Build a Step Functions state machine to optimize your AWS Lambda Function memory/power configuration. | nodeJS |
| [React & Stripe Serverless Ecommerce](https://github.com/patrick-michelberger/serverless-shop) <br/> Serverless E-Commerce App with AWS Lambda, Stripe and React | nodeJS |
| [JSON-Serverless](https://github.com/pharindoko/json-serverless) <br/> A simple & cheap serverless REST API using [json-server](https://github.com/typicode/json-server) in combination with AWS Lambda / S3 and the serverless framework | nodeJS |
| [GoLive](https://github.com/adimoraret/golive/) <br/> Boilerplate to live stream using AWS MediaLive and MediaStore | nodeJS |
| [Idempotent Serverless Functions](https://github.com/Nsupyq/idempotent-serverless-functions) <br/> This repository demonstrates how to ensure the idempotence of serverless functions running on AWS Lambda. | python |
| [File uploads using S3 presigned URLs](https://github.com/marchetti2/aws-node-serverless-upload-presigned-url) <br/> A Serverless photo upload service with API Gateway, S3 presigned URLs and Lambda. | nodeJS |
| [Monorepo Typescript microservices](https://github.com/fargito/serverless-monorepo-microservices-template) <br/> An opinionated Serverless template with several Typescript microservices in a monorepo | nodeJS |
| [Serverless Python Twitch EventSub to Discord Webhook on AWS](https://github.com/dylmye/aws-python-twitch-eventsub-to-discord-webhook) <br/> This template takes go-live events from Twitch EventSub, and publishes the events through a Discord webhook | python |
<!-- AUTO-GENERATED-CONTENT:END -->

## Contributing

We are happy to accept more examples from the community. 🎉

### Adding example code

1. Add a `README.md` to your example with a frontmatter HTML comment listing these required keys:
   - `title`
   - `description`
   - `framework` (use `v4`)
   - `platform`
   - `language`
   - `authorLink`
   - `authorName`
   - `authorAvatar`

2. Add an entry for your example to [examples.json](./examples.json).

3. Validate your frontmatter and regenerate the README.md with:

```bash
npm run validate
npm run docs
```

Both commands must pass, and the regenerated README.md must be included in your PR.

4. Open a new pull request with your example. Please make sure `serverless package` succeeds in your example's directory before submitting. ⚡️

### Adding a community example

We love hearing about projects happening in the community. Feel free to add your serverless project to our growing list.

1. Add an entry to [examples.json](./examples.json) with `"community": true` and a `githubUrl` pointing at your repository.

2. Regenerate the README.md with:

```bash
npm run docs
```

3. Open a new pull request with your example, including the regenerated README.md. ⚡️
