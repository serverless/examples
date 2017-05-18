<!--
title: AWS Data Processing example in NodeJS
description: This example demonstrates how to setup a simple data processing pipeline.
layout: Doc
-->
# Data processing

This example demonstrates how to setup a simple data processing pipeline. The service exposes one HTTP endpoint that allows you to add a text note. This HTTP endpoint returns instantly to provide a good user experience while the actual analysis is deferred. Only messages above a certain sentiment level are actually saved.

Instead of invoking another Lambda function directly it's considered best practice to store the note as a message in a SNS queue. The queue has certain benefits compared to invoking the `analyzeNote` function directly. The queue supports retries in case the analyzeNote function fails as well as back-off to avoid too many concurrent invocations.

## Setup

```bash
npm install
```

In order to use SNS you need to add your AWS account ID to config.js. There is already a placeholder: `XXXXXXXXXXXX`.

You can retrieve the your account ID by running this command (you need the AWS SDK installed)

```bash
aws sts get-caller-identity --output text --query Account
```

# Explanation

- sns topic will be added by default

## Deploy

In order to deploy the you endpoint simply run

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
............
Serverless: Stack update finished…
Serverless: Removing old service versions…

Service Information
service: text-analysis-via-post-processing
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  POST - https://5cvfn0wwv7.execute-api.us-east-1.amazonaws.com/dev/notes
functions:
  text-analysis-via-post-processing-dev-analyzeNote: arn:aws:lambda:us-east-1:377024778620:function:text-analysis-via-post-processing-dev-analyzeNote
  text-analysis-via-post-processing-dev-addNote: arn:aws:lambda:us-east-1:377024778620:function:text-analysis-via-post-processing-dev-addNote
```

## Usage

In order to add a note run

```bash
curl -X POST https://XXXXXXXXX.execute-api.us-east-1.amazonaws.com/dev/notes --data '{ "note": "This is such a great Day" }'
```

You should see the following output

```bash
{"message":"Successfully added the note."}%
```

To verify that the note has been processed run

```bash
serverless logs --function analyzeNote
```

This command will show you the logged output and looks liked this

```bash
START RequestId: 75a970ba-ab54-11e6-809d-435833490828 Version: $LATEST
2016-11-15 17:56:32.497 (+01:00)	75a970ba-ab54-11e6-809d-435833490828	Positive note - will be published: This is such a great Day
END RequestId: 75a970ba-ab54-11e6-809d-435833490828
REPORT RequestId: 75a970ba-ab54-11e6-809d-435833490828	Duration: 3.45 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 15 MB
```

You can play with the system and see which notes will be published and which won't.

# Scaling

TODO
