<!--
title: 'AWS Data Processing example in NodeJS'
description: 'This example demonstrates how to setup a simple data processing pipeline.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/adambrgmn'
authorName: 'Adam Bergman'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13746650?v=4&s=140'
-->
# Data processing

This example demonstrates how to setup a simple data processing pipeline. The service exposes one HTTP endpoint that allows you to add a text note. This HTTP endpoint returns instantly to provide a good user experience while the actual analysis is deferred. Only messages above a certain sentiment level are actually saved.

Instead of invoking another Lambda function directly it's considered best practice to store the note as a message in a SNS queue. The queue has certain benefits compared to invoking the `analyzeNote` function directly. The queue supports retries in case the analyzeNote function fails as well as back-off to avoid too many concurrent invocations.

## Setup

```bash
npm install
```

The SNS topic ARN is built automatically at deploy time from your AWS account ID and region (`${aws:accountId}` / `${aws:region}`), so there's no manual configuration needed.

# Explanation

- sns topic will be added by default

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Deploying text-analysis-sns to stage dev (us-east-1)

✔ Service deployed to stack text-analysis-sns-dev (38s)

endpoint: POST - https://5cvfn0wwv7.execute-api.us-east-1.amazonaws.com/dev/notes
functions:
  addNote: text-analysis-sns-dev-addNote (1.2 kB)
  analyzeNote: text-analysis-sns-dev-analyzeNote (1.2 kB)
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
START RequestId: 75a970ba-ab11e6-809d-435833490828 Version: $LATEST
2026-07-15T17:56:32.497Z	75a970ba-ab11e6-809d-435833490828	Positive note - will be published: This is such a great Day
END RequestId: 75a970ba-ab11e6-809d-435833490828
REPORT RequestId: 75a970ba-ab11e6-809d-435833490828	Duration: 3.45 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 15 MB
```

You can play with the system and see which notes will be published and which won't.
