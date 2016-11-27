# Recursive Lambda function Invocation

This is an example of a function that will recursively call itself.

**Warning** It's possible to run into infinite loops with recursive calls. Test your functions locally before deploying to production

## Use cases

- Functions that run longer that 5 minutes

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

The ARN in this example is `arn:aws:lambda:us-east-1:488110005556:function:recursive-invocation-example-dev-recursiveExample`

Run `serverless info` to retrieve this data again if you need it.

#### 2. Take your newly created function's ARN and replace the custom: functionARN value `yourFunctionARN` value in `serverless.yml` with your ARN.

Before:
```yml
custom:
  functionARN: yourFunctionARN
```

After:
```yml
custom:
  functionARN: arn:aws:lambda:us-east-1:488110005556:function:recursive-invocation-example-dev-recursiveExample
```

#### 3. Uncomment the IAM statement in `serverless.yml`

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

The `custom: functionARN` value is referenced as a [serverless variable](https://serverless.com/framework/docs/providers/aws/guide/variables/) in the IAM statement the variable syntax `${self:custom:functionARN}`

For more information on serverless variables. [Read the variable docs](https://serverless.com/framework/docs/providers/aws/guide/variables/).

#### 4. Redeploy the function to enable the new IAM role.

Run `sls deploy` again to redeploy the service and apply the new IAM role needed for the function to call itself.

## Invoking

**Important** Make sure to set a limit on the number of invocations and test locally first to avoid infinite recursive loops in AWS.

```bash
sls invoke -f recursiveExample -p event.json
```
