[Website](http://www.serverless.com) • [Email Updates](http://eepurl.com/b8dv4P) • [Gitter](https://gitter.im/serverless/serverless) • [Forum](http://forum.serverless.com) • [Meetups](https://github.com/serverless-meetups/main) • [Twitter](https://twitter.com/goserverless) • [Facebook](https://www.facebook.com/serverless) • [Contact Us](mailto:hello@serverless.com)

# Serverless Examples

A collection of ready-to-deploy [Serverless Framework](https://github.com/serverless/serverless) services.

## Table of Contents
<!-- AUTO-GENERATED-CONTENT:START (TOC) generated w/ `npm run docs` -->
- [Getting Started](#getting-started)
- [Examples](#examples)
- [Community Examples](#community-examples)
- [Contributing](#contributing)
  * [Adding example code](#adding-example-code)
  * [Adding a community example](#adding-a-community-example)
<!-- AUTO-GENERATED-CONTENT:END -->

## Getting Started

If you are new to serverless, we recommend getting started with:

- Creating an HTTP API Endpoint [(NodeJS)](https://github.com/serverless/examples/tree/master/aws-node-simple-http-endpoint) | [(Python)](https://github.com/serverless/examples/tree/master/aws-python-simple-http-endpoint) | [(Java)](https://github.com/serverless/examples/tree/master/aws-java-simple-http-endpoint)
- [Scheduled Cron Example](https://github.com/serverless/examples/tree/master/aws-node-scheduled-cron)
- [Fetch File & Store in S3](https://github.com/serverless/examples/tree/master/aws-node-fetch-file-and-store-in-s3)

Each example contains a README.md with an explanation about the service, it's use cases and a guide on deploying.

## Examples

Have an example? Submit a PR or [open an issue](https://github.com/serverless/examples/issues). ⚡️

<!-- AUTO-GENERATED-CONTENT:START (SERVERLESS_EXAMPLE_TABLE) t generated w/ `npm run docs` -->
| Example | Runtime  |
|:--------------------------- |:-----|
| [Aws Alexa Skill](https://github.com/serverless/examples/tree/master/aws-node-alexa-skill) <br/> This example demonstrates how to use an AWS Lambdas for your custom Alexa skill. | nodeJS |
| [Aws Auth0 Api Gateway](https://github.com/serverless/examples/tree/master/aws-node-auth0-custom-authorizers-api) <br/> Demonstration of protecting API gateway endpoints with auth0 | nodeJS |
| [Aws Env Variables Encrypted In A File](https://github.com/serverless/examples/tree/master/aws-node-env-variables-encrypted-in-a-file) <br/> Serverless example managing secrets in an encrypted file | nodeJS |
| [Aws Env Variables](https://github.com/serverless/examples/tree/master/aws-node-env-variables) <br/> This example demonstrates how to use environment variables for AWS Lambdas. | nodeJS |
| [Aws Fetch File And Store In S3](https://github.com/serverless/examples/tree/master/aws-node-fetch-file-and-store-in-s3) <br/> Fetch an image from remote source (URL) and then upload the image to a S3 bucket. | nodeJS |
| [Aws Function Compiled With Babel](https://github.com/serverless/examples/tree/master/aws-node-function-compiled-with-babel) <br/> Demonstrating how to compile all your code with Babel | nodeJS |
| [Aws Github Webhook Listener](https://github.com/serverless/examples/tree/master/aws-node-github-webhook-listener) <br/> Extend your github repositories with this github webhook listener | nodeJS |
| [Aws Iot Event](https://github.com/serverless/examples/tree/master/aws-node-iot-event) <br/> Example on how to setup a AWS IoT Rule to send events to a Lambda function | nodeJS |
| [Aws Rest With Dynamodb](https://github.com/serverless/examples/tree/master/aws-node-rest-api-with-dynamodb) <br/> Serverless CRUD service exposing a REST HTTP interface | nodeJS |
| [Aws Scheduled Cron](https://github.com/serverless/examples/tree/master/aws-node-scheduled-cron) <br/> Example of creating a function that runs as a cron job using the serverless `schedule` event | nodeJS |
| [Aws Scheduled Weather](https://github.com/serverless/examples/tree/master/aws-node-scheduled-weather) <br/> Example of creating a function that runs as a cron job using the serverless `schedule` event through pulling weather and sending an email daily. | nodeJS |
| [Aws Serve Dynamic Html Via Http Endpoint](https://github.com/serverless/examples/tree/master/aws-node-serve-dynamic-html-via-http-endpoint) <br/> Hookup an AWS API Gateway endpoint to a Lambda function to render HTML on a `GET` request | nodeJS |
| [Aws Serve Simple Http Endpoint](https://github.com/serverless/examples/tree/master/aws-node-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint | nodeJS |
| [Aws Single Page App Via Cloudfront](https://github.com/serverless/examples/tree/master/aws-node-single-page-app-via-cloudfront) <br/> Demonstrating how to deploy a Single Page Application with Serverless | nodeJS |
| [Serverless Single Page App Plugin](https://github.com/serverless/examples/tree/master/aws-node-single-page-app-via-cloudfront/serverless-single-page-app-plugin) <br/> A plugin to simplify deploying Single Page Application using S3 and CloudFront | nodeJS |
| [Aws Text Analysis Via Sns Post Processing](https://github.com/serverless/examples/tree/master/aws-node-text-analysis-via-sns-post-processing) <br/> Example demonstrates how to setup a simple data processing pipeline | nodeJS |
| [Aws Node Twilio Send Text Message](https://github.com/serverless/examples/tree/master/aws-node-twilio-send-text-message) <br/> Send a text message via twilio from aws lambda. [See live demo](http://twilio-serverless-example.surge.sh) | nodeJS |
| [Aws Alexa Skill](https://github.com/serverless/examples/tree/master/aws-python-alexa-skill) <br/> This example demonstrates how to use an AWS Lambdas for your custom Alexa skill. | python |
| [Aws Rest With Dynamodb](https://github.com/serverless/examples/tree/master/aws-python-rest-api-with-dynamodb) <br/> Serverless CRUD service exposing a REST HTTP interface | python |
| [Aws Scheduled Cron](https://github.com/serverless/examples/tree/master/aws-python-scheduled-cron) <br/> Example of creating a function that runs as a cron job using the serverless `schedule` event | python |
| [Aws Simple Http Endpoint](https://github.com/serverless/examples/tree/master/aws-python-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with python | python |
| [Openwhisk Node Chaining Functions](https://github.com/serverless/examples/tree/master/openwhisk-node-chaining-functions) <br/> Example of chaining function calls using sequences and the sdk. | nodeJS |
| [Openwhisk Node Scheduled Cron](https://github.com/serverless/examples/tree/master/openwhisk-node-scheduled-cron) <br/> Example of creating a function that runs as a cron job using the serverless schedule event. | nodeJS |
| [Openwhisk Node Simple Http](https://github.com/serverless/examples/tree/master/openwhisk-node-simple-http-endpoint) <br/> Example demonstrates how to setup a simple HTTP GET endpoint with OpenWhisk. | nodeJS |
| [Openwhisk Node Simple](https://github.com/serverless/examples/tree/master/openwhisk-node-simple) <br/> Simple example demonstrating OpenWhisk provider support. | nodeJS |

<!-- AUTO-GENERATED-CONTENT:END -->

## Community Examples

[Add an example](https://github.com/serverless/examples/edit/master/community-examples.json)

<!-- AUTO-GENERATED-CONTENT:START (COMMUNITY_EXAMPLES_TABLE)  generated w/ `npm run docs` -->
| Example | Author |
|:-------|:------:|
| **[Cordis Serverless](https://github.com/marzeelabs/cordis-serverless)** <br/> A serverless API for EU Cordis data | [marzeelabs](http://github.com/marzeelabs) |
| **[Giphy Bot](https://github.com/tywong/lambda-workshop-2016/tree/master/giphy-bot)** <br/> giphy-bot for Facebook chat | [tywong](http://github.com/tywong) |
| **[Jrestless Examples](https://github.com/bbilger/jrestless-examples)** <br/> [JRestless](https://github.com/bbilger/jrestless) (Java / JAX-RS) examples for [API Gateway Functions](https://github.com/bbilger/jrestless-examples/tree/master/aws/gateway) ([plain JAX-RS](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-showcase), [Spring](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-spring), [binary data requests/responses](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-binary), [custom authorizers](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-security-custom-authorizer) and [Cognito User Pool authorizers](https://github.com/bbilger/jrestless-examples/blob/master/aws/gateway/aws-gateway-security-cognito-authorizer)), [SNS Functions](https://github.com/bbilger/jrestless-examples/blob/master/aws/sns/aws-sns-usage-example) (asynchronous communication between functions) and [Service Functions](https://github.com/bbilger/jrestless-examples/blob/master/aws/service/aws-service-usage-example) (synchronous HTTP-like communication between functions - transparent through Feign) | [bbilger](http://github.com/bbilger) |
| **[Jwt Lambda Python](https://github.com/mikaelmork/jwt-auth.serverless)** <br/> Minimal proof-of-concept implementation of JWT with Serverless / AWS Lambda | [mikaelmork](http://github.com/mikaelmork) |
| **[Keboola Developer Portal](https://github.com/keboola/developer-portal)** <br/> Keboola developer portal built with Serverless | [keboola](http://github.com/keboola) |
| **[Offset Trump](https://github.com/FLGMwt/offset-trump)** <br/> Single page app using Serverless (C# runtime) and S3 site hosting. Pledge to do a good thing for the next four years to offset the potential negative effects of the US Presidency | [FLGMwt](http://github.com/FLGMwt) |
| **[Pfs Email Serverless](https://github.com/SCPR/pfs-email-serverless)** <br/> This is a lambda function created by the serverless framework. It searches through members in our mongodb who have not been sent emails and sends them an email with their custom token to unlock the pledge free stream. It then marks those members off as already receiving the email. | [SCPR](http://github.com/SCPR) |
| **[Plaid Cashburndown Service](https://github.com/cplee/cashburndown-service)** <br/> Service for calculating cash burndown with plaid. Frontend code can be found here: https://github.com/cplee/cashburndown-site | [cplee](http://github.com/cplee) |
| **[Sc5 Serverless Boilerplate](https://github.com/SC5/sc5-serverless-boilerplate)** <br/> A boilerplate that contains setup for test-driven development | [SC5](http://github.com/SC5) |
| **[Serverless Aws Rekognition Finpics](https://github.com/rgfindl/finpics)** <br/> Use AWS Rekognition to provide a faces search of finpics.com | [rgfindl](http://github.com/rgfindl) |
| **[Serverless Blog To Podcast](https://github.com/SC5/serverless-blog-to-podcast)** <br/> Service that reads RSS feed and converts the entries to a podcast feed and audio files using Amazon Polly | [SC5](http://github.com/SC5) |
| **[Serverless Cloudwatch Rds Custom Metrics](https://github.com/AndrewFarley/serverless-cloudwatch-rds-custom-metrics)** <br/> A NodeJS-based MySQL RDS Data Collection script to push Custom Metrics to Cloudwatch with Serverless | [AndrewFarley](http://github.com/AndrewFarley) |
| **[Serverless Delivery Framework](https://github.com/99xt/serverless-delivery-framework)** <br/> This is a boilerplate for version release pipeline with serverless framework | [99xt](http://github.com/99xt) |
| **[Serverless Facebook Quotebot](https://github.com/pmuens/quotebot)** <br/> 100% Serverless Facebook messenger chatbot which will respond with inspiring quotes | [pmuens](http://github.com/pmuens) |
| **[Serverless Garden Aid](https://github.com/garden-aid/web-bff)** <br/> IoT Garden Aid Backend | [garden-aid](http://github.com/garden-aid) |
| **[Serverless Mailgun Slack](https://github.com/Marcus-L/serverless-mailgun-slack)** <br/> A Serverless function for posting to a Slack Webhook in response to a Mailgun route | [Marcus-L](http://github.com/Marcus-L) |
| **[Serverless Messenger Boilerplate](https://github.com/SC5/serverless-messenger-boilerplate)** <br/> Serverless messenger bot boilerplate | [SC5](http://github.com/SC5) |
| **[Serverless Msg Gateway](https://github.com/yonahforst/msg-gateway)** <br/> A messaging aggregator for kik, skype, twilio, telegram, & messenger. Send and receive messages in a standard format. | [yonahforst](http://github.com/yonahforst) |
| **[Serverless Newsletter Signup](https://github.com/ivanderbu2/serverless-newsletter-signup)** <br/> Saves user details into DynamoDB table. Required values are email, first_name and last_name. | [ivanderbu2](http://github.com/ivanderbu2) |
| **[Serverless Npm Registry](https://github.com/craftship/yith)** <br/> Serverless private npm registry, proxy and cache. | [craftship](http://github.com/craftship) |
| **[Serverless Pokego](https://github.com/jch254/pokego-serverless)** <br/> Serverless-powered API to fetch nearby Pokemon Go data | [jch254](http://github.com/jch254) |
| **[Serverless Postgraphql](https://github.com/rentrop/serverless-postgraphql)** <br/> GraphQL endpoint for PostgreSQL using postgraphql | [rentrop](http://github.com/rentrop) |
| **[Serverless Python Sample](https://github.com/bennybauer/serverless-python-sample)** <br/> A simple serverless python sample with REST API endpoints and dependencies | [bennybauer](http://github.com/bennybauer) |
| **[Serverless React Boilerplate](https://github.com/99xt/serverless-react-boilerplate)** <br/> A serverless react boilerplate for offline development | [99xt](http://github.com/99xt) |
| **[Serverless Screenshot](https://github.com/svdgraaf/serverless-screenshot)** <br/> Serverless Screenshot Service using PhantomJS | [svdgraaf](http://github.com/svdgraaf) |
| **[Serverless Slack Cron](https://github.com/ivanderbu2/serverless-slack-cron)** <br/> Lambda function which sends messages to Slack channel in regular intervals via cron trigger. | [ivanderbu2](http://github.com/ivanderbu2) |
| **[Serverless Slack Emojibot](https://github.com/markhobson/emojibot)** <br/> Serverless slack bot for emoji | [markhobson](http://github.com/markhobson) |
| **[Serverless Slack Trevorbot](https://github.com/conveyal/trevorbot)** <br/> Slack bot for info on where in the world is Trevor Gerhardt? | [conveyal](http://github.com/conveyal) |
| **[Serverless Url Shortener](https://github.com/aletheia/serverless-url-shortener)** <br/> A simple url-shortener, using Serverless framework | [aletheia](http://github.com/aletheia) |
| **[Serverless Weekly2pocket App](https://github.com/s0enke/weekly2pocket)** <br/> Serverless-powered API for sending posts to pocket app | [s0enke](http://github.com/s0enke) |
| **[Sls Access Counter](https://github.com/takahashim/sls-access-counter)** <br/> Site visitor counter | [takahashim](http://github.com/takahashim) |
| **[Sls Form Mail](https://github.com/takahashim/sls-form-mail)** <br/> Send SNS email from form data | [takahashim](http://github.com/takahashim) |
<!-- AUTO-GENERATED-CONTENT:END -->

## Contributing

We are happy to accept more examples from the community. 🎉

### Adding example code

1. Make sure your contribution matches the linting setup for this repo:

  Run the linting via

  ```bash
  npm run lint
  ```

2. Add a `package.json` file in your example with the name of the example and a `description` and any `dependancies` used.

3. Regenerate the README.md with the following command

  ```bash
  npm run docs
  ```

4. Open a new pull request with your example. ⚡️

### Adding a community example

We love hearing about projects happening in the community. Feel free to add your serverless project to our growing list.

1. Add `link`, `title`, and `description` to the [community-examples.json](https://github.com/serverless/examples/edit/master/community-examples.json) file.

2. Open a new pull request with your example. ⚡️
