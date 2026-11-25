<!--
title: 'AWS Data Processing example in NodeJS'
description: 'This example shows how a Lambda function behind an HTTP API publishes a note to an Amazon SNS topic and a second function subscribed to the topic analyzes it.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/adambrgmn'
authorName: 'Adam Bergman'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13746650?v=4&s=140'
-->

# Post-process requests with Amazon SNS and Lambda

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-text-analysis-via-sns-post-processing.svg)](https://github.com/serverless/examples/blob/verified/results.json)

An HTTP endpoint can answer right away and leave slow work for later: it publishes the request to an Amazon SNS topic, and a second function subscribed to the topic does the work. The [`sns` event](https://www.serverless.com/framework/docs/providers/aws/events/sns) of the Serverless Framework creates the topic, the subscription and the permission that lets SNS invoke the function. This example accepts a text note at `POST /notes`, publishes it to a topic, and has a subscriber function analyze the note and log the result.

## What it deploys

- An HTTP API with one route, `POST /notes`, and a Lambda function, `addNote`, that publishes each note to the topic.
- An SNS topic named `text-analysis-sns-<stage>-notes`.
- A Lambda function, `analyzeNote`, subscribed to the topic, which counts the words, sentences and characters of each note and logs them.
- An IAM role that lets the functions write their logs and lets `addNote` publish to this topic only, and a CloudWatch Logs log group for each function.

## Prerequisites

- The Serverless Framework CLI: `npm i -g serverless`, which needs [Node.js](https://nodejs.org/). See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.
- `curl`, to send a note. The commands in Try it are written for Bash.

## Deploy

Deploy from this directory:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "text-analysis-sns" to stage "dev" (us-east-1)
✔ Service deployed to stack text-analysis-sns-dev (83s)
endpoint: POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/notes

functions:
  addNote: text-analysis-sns-dev-addNote (6.4 kB)
  analyzeNote: text-analysis-sns-dev-analyzeNote (6.4 kB)
```

## Try it

Copy the endpoint from the deploy output into a shell variable:

```bash
URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/notes
```

Send a note:

```bash
curl -X POST "$URL" -H 'content-type: application/json' \
  --data '{"note": "Lambda read this note later. The API answered first!"}'
```

The API answers with status 202 and the ID of the SNS message, before the note is analyzed:

```json
{"messageId":"7414c426-1aa6-518d-8d0b-a7a74b40e013"}
```

SNS invokes `analyzeNote` a moment later. Its log shows the analysis, under the same message ID:

```bash
serverless logs --function analyzeNote
```

```text
INFO	Analyzed note 7414c426-1aa6-518d-8d0b-a7a74b40e013: 9 words, 2 sentences, 52 characters
```

If the line isn't there yet, wait a few seconds and run the command again. A body without a `note` string gets status 400 and `{"error":"Send a JSON body with a \"note\" string."}`, and nothing is published.

## How it works

The `sns` event in [`serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-text-analysis-via-sns-post-processing/serverless.yml) names a topic, so the Framework creates the topic, subscribes `analyzeNote` to it and lets SNS invoke the function. The `addNote` function gets the topic's ARN in an environment variable, and its role may publish to that topic only:

```yaml
custom:
  topicName: ${self:service}-${sls:stage}-notes
  topicArn: arn:aws:sns:${aws:region}:${aws:accountId}:${self:custom.topicName}

provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - sns:Publish
          Resource: ${self:custom.topicArn}

functions:
  addNote:
    handler: handler.addNote
    environment:
      TOPIC_ARN: ${self:custom.topicArn}
    events:
      - httpApi:
          path: /notes
          method: post

  analyzeNote:
    handler: handler.analyzeNote
    events:
      - sns:
          topicName: ${self:custom.topicName}
```

Topic names are unique per account and Region, so the name includes the stage: two stages get two topics.

[`handler.mjs`](https://github.com/serverless/examples/blob/v4/aws-node-text-analysis-via-sns-post-processing/handler.mjs) holds both functions. `addNote` publishes the note with the AWS SDK for JavaScript v3, which the Node.js runtime includes, and returns the message ID without waiting for the analysis:

```javascript
const { MessageId } = await sns.send(new PublishCommand({ TopicArn: process.env.TOPIC_ARN, Message: note }));
return { statusCode: 202, body: JSON.stringify({ messageId: MessageId }) };
```

SNS invokes `analyzeNote` asynchronously with the message in `event.Records`, and the function reads the text from `Sns.Message`:

```javascript
for (const record of event.Records) {
  const { MessageId, Message } = record.Sns;
  // ...
  console.log(`Analyzed note ${MessageId}: ${words} words, ${sentences} sentences, ${Message.length} characters`);
}
```

Because the topic sits between the two functions, more subscribers (another function, an SQS queue, an email address) can receive the same notes without a change to `addNote`. When `analyzeNote` returns an error, Lambda retries the asynchronous invocation; see [Using Lambda with Amazon SNS](https://docs.aws.amazon.com/lambda/latest/dg/with-sns.html).

## Cost and cleanup

While the example is deployed, API Gateway bills each request to the HTTP API, Amazon SNS bills each published message and its deliveries, Lambda bills each invocation and the functions' compute time, and CloudWatch Logs bills the functions' stored log data. See [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/), [Amazon SNS pricing](https://aws.amazon.com/sns/pricing/), [Lambda pricing](https://aws.amazon.com/lambda/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/).

Remove the API, the topic, the functions and their log groups:

```bash
serverless remove
```

## Next steps

- Read [SNS topic events](https://www.serverless.com/framework/docs/providers/aws/events/sns) for subscribing to an existing topic, filter policies that send each function only some messages, and a dead-letter queue for messages SNS can't deliver.
- Send the notes to a queue instead, so a worker reads them in batches at its own pace, as the [SQS worker example](https://github.com/serverless/examples/tree/v4/aws-node-sqs-worker) does.
- Store each analysis in a table, as the [HTTP API with DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-node-http-api-dynamodb) does for API requests.
