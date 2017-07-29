<!--
title: AWS Recursive Lambda function Invocation example in NodeJS
description: This is an example of a function that will recursively call itself.
layout: Doc
-->
# Recursive Lambda function Invocation

This is an example of a function that will recursively call itself.

**Warning** It's possible to run into infinite loops with recursive calls.

Test your functions [locally](https://serverless.com/framework/docs/providers/aws/cli-reference/invoke#invoke-local) before deploying to production.

## Use cases

- Functions that run longer that 5 minutes
- [Use recursive function to process SQS messages](http://theburningmonk.com/2016/04/aws-lambda-use-recursive-function-to-process-sqs-messages-part-1/)
- [Lamdba chaining](https://github.com/pmuens/serverless-lambda-chaining)

Running a function recursively will allow you to pass state information to the next function call.

## Setup

#### 1. Deploy the function with `sls deploy`

The `sls deploy` command will give you back the function ARN (Amazon Resource Name) needed for the function to recursively call itself.

The message should look something like:

```bash
Service Information
service: recursive-invocation-example
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  recursive-invocation-example-dev-recursiveExample: arn:aws:lambda:us-east-1:488110005556:function:recursive-invocation-example-dev-recursiveExample
```

The ARN in this example is `arn:aws:lambda:us-east-1:488110005556:function:recursive-invocation-example-dev-recursiveExample`. If you need to retrieve this data again run the `serverless info` command.

#### 2. Take your newly created function's ARN and replace the custom: functionARN value `yourFunctionARN` value in `serverless.yml` with your ARN.

Before:
```yml
# in serverless.yml
custom:
  functionARN: yourFunctionARN
```

After:
```yml
# in serverless.yml
custom:
  functionARN: arn:aws:lambda:us-east-1:488110005556:function:recursive-invocation-example-dev-recursiveExample
```

#### 3. Uncomment the IAM statement in `serverless.yml`

```yml
# in serverless.yml
provider:
  name: aws
  runtime: nodejs4.3
  iamRoleStatements:
    -  Effect: "Allow"
       Action:
         - "lambda:InvokeFunction"
       Resource: ${self:custom.functionARN}
```

The `custom: functionARN` value is referenced as a [serverless variable](https://serverless.com/framework/docs/providers/aws/guide/variables/) in the IAM statement the variable syntax `${self:custom.functionARN}`

For more information on serverless variables. [Read the variable docs](https://serverless.com/framework/docs/providers/aws/guide/variables/).

#### 4. Redeploy the function to enable the new IAM role.

Run `sls deploy` again to redeploy the service and apply the new IAM role needed for the function to call itself.

## Invoking

**Important** Make sure to set a limit on the number of invocations and test locally first to avoid infinite recursive loops in AWS.

**Invoke the function:**

```bash
sls invoke -f recursiveExample -p event.json
```

**See the logs of the recursive calls:**

```
sls logs -f recursiveExample
```

The logs output should look something like:

```bash
START RequestId: 43a9d525-b46c-11e6-b6bc-718f7ec807df Version: $LATEST
2016-11-26 22:39:37.769 (-08:00)  43a9d525-b46c-11e6-b6bc-718f7ec807df  received { numberOfCalls: 5 }
2016-11-26 22:39:37.792 (-08:00)  43a9d525-b46c-11e6-b6bc-718f7ec807df  recursive call
END RequestId: 43a9d525-b46c-11e6-b6bc-718f7ec807df
REPORT RequestId: 43a9d525-b46c-11e6-b6bc-718f7ec807df  Duration: 270.23 ms Billed Duration: 300 ms   Memory Size: 1024 MB  Max Memory Used: 32 MB

START RequestId: 446bed13-b46c-11e6-88fd-1bd64622e38d Version: $LATEST
2016-11-26 22:39:37.966 (-08:00)  446bed13-b46c-11e6-88fd-1bd64622e38d  received { numberOfCalls: 4 }
2016-11-26 22:39:37.966 (-08:00)  446bed13-b46c-11e6-88fd-1bd64622e38d  recursive call
END RequestId: 446bed13-b46c-11e6-88fd-1bd64622e38d
REPORT RequestId: 446bed13-b46c-11e6-88fd-1bd64622e38d  Duration: 119.04 ms Billed Duration: 200 ms   Memory Size: 1024 MB  Max Memory Used: 32 MB

START RequestId: 4479f619-b46c-11e6-b200-7d58a248a566 Version: $LATEST
2016-11-26 22:39:38.122 (-08:00)  4479f619-b46c-11e6-b200-7d58a248a566  received { numberOfCalls: 3 }
2016-11-26 22:39:38.122 (-08:00)  4479f619-b46c-11e6-b200-7d58a248a566  recursive call
END RequestId: 4479f619-b46c-11e6-b200-7d58a248a566
REPORT RequestId: 4479f619-b46c-11e6-b200-7d58a248a566  Duration: 40.55 ms  Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 32 MB

START RequestId: 44914f38-b46c-11e6-ae2b-65715f0c0d90 Version: $LATEST
2016-11-26 22:39:38.196 (-08:00)  44914f38-b46c-11e6-ae2b-65715f0c0d90  received { numberOfCalls: 2 }
2016-11-26 22:39:38.196 (-08:00)  44914f38-b46c-11e6-ae2b-65715f0c0d90  recursive call
END RequestId: 44914f38-b46c-11e6-ae2b-65715f0c0d90
REPORT RequestId: 44914f38-b46c-11e6-ae2b-65715f0c0d90  Duration: 32.38 ms  Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 32 MB

START RequestId: 449c72f5-b46c-11e6-a470-41cb6f0603cc Version: $LATEST
2016-11-26 22:39:38.268 (-08:00)  449c72f5-b46c-11e6-a470-41cb6f0603cc  received { numberOfCalls: 1 }
2016-11-26 22:39:38.268 (-08:00)  449c72f5-b46c-11e6-a470-41cb6f0603cc  recursive call
END RequestId: 449c72f5-b46c-11e6-a470-41cb6f0603cc
REPORT RequestId: 449c72f5-b46c-11e6-a470-41cb6f0603cc  Duration: 49.82 ms  Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 32 MB

START RequestId: 44a8f64b-b46c-11e6-b077-535b4cab8224 Version: $LATEST
2016-11-26 22:39:38.350 (-08:00)  44a8f64b-b46c-11e6-b077-535b4cab8224  received { numberOfCalls: 0 }
2016-11-26 22:39:38.350 (-08:00)  44a8f64b-b46c-11e6-b077-535b4cab8224  recursive call finished
END RequestId: 44a8f64b-b46c-11e6-b077-535b4cab8224
REPORT RequestId: 44a8f64b-b46c-11e6-b077-535b4cab8224  Duration: 0.56 ms Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 32 MB
```

