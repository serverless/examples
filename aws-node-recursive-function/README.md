# Recursive Lambda function Invocation

This is an example of a function that will recursively call itself.

**Warning** It's possible to run into infinite loops with recursive calls. Test your functions locally before deploying to production

## Use cases

- Functions that run longer that 5 minutes

Running a function recursively will allow you to pass state information to the next function call.

## Setup

1. Deploy the function with `sls deploy`

2. Then grab the function ARN with `sls info`. The function ARN will look like `arn:aws:lambda:us-east-1:000000000000000:function:xxxxx`

3. Change the `functionARN` in the `serverless.yml` file to your functions ARN. This will give the function access to call itself.

```yml
# serverless.yml
custom:
  functionARN: insertYourFunctionARNHERE # arn:aws:lambda:region:000000:function:xxxxx
```

The `custom: functionARN` value is referenced as a [serverless variable](https://serverless.com/framework/docs/providers/aws/guide/variables/) in the IAM statement the variable syntax `${self:custom:functionARN}`

```yml
provider:
  name: aws
  runtime: nodejs4.3
  iamRoleStatements:
    -  Effect: "Allow"
       Action:
         - "lambda:InvokeFunction"
       Resource: ${self:custom:functionARN}
```

For more information on serverless variables. [Read the variable docs](https://serverless.com/framework/docs/providers/aws/guide/variables/).

## Invoking

**Important** Make sure to set a limit on the number of invocations and test locally first to avoid infinite recursive loops in AWS.

```bash
sls invoke -f recursiveExample -p event.json
```
