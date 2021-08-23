<!--
title: 'AWS Serverless Alexa Skill example in NodeJS'
description: 'This example demonstrates how to setup your own Alexa skill using AWS Lambdas.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/rupakg'
authorName: 'Rupak Ganguly'
authorAvatar: 'https://avatars0.githubusercontent.com/u/8188?v=4&s=140'
-->
# Serverless Alexa Skill Example

This example demonstrates how to setup your own Alexa skill using AWS Lambdas.

## Use-cases

- Building custom Alexa skills

## How it works

In the Alexa Developer Portal you can add your own skill. To do so you need to define the available intents and then connect them to a Lambda. You can update and define the Lambda with Serverless.

## Setup

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (378 B)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.........
Serverless: Stack update finished...
Serverless: Removing old service versions...
Service Information
service: aws-node-alexa-skill-2
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  aws-node-alexa-skill-2-dev-luckyNumber: arn:aws:lambda:us-east-1:377024778620:function:aws-node-alexa-skill-2-dev-luckyNumber

```

Next we need to setup an Alexa skill. Once you've signed up for the Amazon Developer Platform visit `https://developer.amazon.com/edw/home.html`. There you should see the following screen:

![Welcome](https://cloud.githubusercontent.com/assets/223045/21183285/8403b37c-c211e6-89c0-d36582010af8.png)

Next click on `Add a new Skill`:

![Add Skill](https://cloud.githubusercontent.com/assets/223045/21183286/840512c211e6-84945b6b45e83b.png)

Go through the steps and fill in all the required fields e.g. Intent Schema and Sample Utterances:

Intent Schema
```
{
  "intents": [
    {
      "intent": "GetLuckyNumbers",
      "slots": [
        {
          "name": "UpperLimit",
          "type": "AMAZON.NUMBER"
        }
      ]
    }
  ]
}
```

Sample Utterances
```
GetLuckyNumbers what are my lucky numbers
GetLuckyNumbers tell me my lucky numbers
GetLuckyNumbers what are my lucky numbers lower than {UpperLimit}
GetLuckyNumbers tell me my lucky numbers lower than {UpperLimit}
```

![Skill Information](https://cloud.githubusercontent.com/assets/223045/21183279/83eec4c211e6-841b-d8925f0804a5.png)
![Interaction Model](https://cloud.githubusercontent.com/assets/223045/21183280/83ef3dc211e6-87a5-bb8dcbb903f8.png)

Fill in the Lambda ARN which was printed or run `serverless info` to retrieve the ARN again.

![Configuration](https://cloud.githubusercontent.com/assets/223045/21183281/83f170c211e6-89b7-2f6d96ac559c.png)

Next up visit the test page, fill in the utterance and click on `Ask LuckyNumbers`.

![Test](https://cloud.githubusercontent.com/assets/223045/21183283/83f1f6c211e6-858d-41b1a3154e91.png)
![Test](https://cloud.githubusercontent.com/assets/223045/21183282/83f1f6c211e6-974e-b7c051ffb6eb.png)
![Test](https://cloud.githubusercontent.com/assets/223045/21183284/83f708ac-c211e6-819489e8f3e494.png)
![Test](https://cloud.githubusercontent.com/assets/223045/21185805/78c1dfc211e6-9cf9-ce44edc30cdd.gif)

You should have received a response containing the text `Your lucky number is` followed by your lucky number :)

Check out this [Amazon guide](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/steps-to-build-a-custom-skill#your-skill-is-published-now-what) to learn more about how to submit your skill for publication.
