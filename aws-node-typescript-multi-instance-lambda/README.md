# Multi-instance Serverless AWS Lambda function example

This example demonstrates how to deploy multiple instances (or copies) of the same lambda function by using the "--param" `sls` option to pass in an instance name. The main idea is to rename AWS resources and outputs which would otherwise clash using the instance name.

A lambda instance's configuration can then be made instance-specific by adding the instance name to its environment variable or parameter store keys.

The benefit of this approach is that only one lambda function needs to be defined in `serverless.ts` (or `serverless.yml`), but any number of copies of it can be deployed directly from the command line.

## Setup

1. Install Node.js 18 (recommended: [Node Version Manager](https://github.com/nvm-sh/nvm#install--update-script)).

2. Install packages:
   ```bash
   npm i
   ```

## Use case

When you want to deploy multiple lambda functions with the same implementation, but you don't want to explicitly define each copy in `serverless.yml`.

For example, you could deploy the lambda copies in a continuous deployment (CD) pipeline and configure them to fetch data from different sources based on their instance names.

## Usage

### Deployment

To deploy an instance "foo" of the lambda `hello` to the default `dev` stage in the `ap-southeast-2` region , run:

```bash
npx sls deploy --region ap-southeast-2 --param="instance=foo"
```

Another instance, "bar", can be deployed with:

```bash
npx sls deploy --region ap-southeast-2 --param="instance=bar"
```

Now, two separate yet identical `hello` lambdas are available on AWS:
<img src="./.images/aws-lambda-screenshot.png" alt="Both instances of `hello` are deployed." width="600"/>
<br>

Note that the "--param" option is now required when running other `serverless` commands, such as `sls info`:

```bash
npx sls info --region ap-southeast-2 --param="instance=foo"
```

### Invocation

To invoke an instance of `hello` using `sls invoke`, pass the instance name to the "--param" option:

```bash
npx sls invoke -f hello --region ap-southeast-2 --param="instance=foo"
```

Output:

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Function `aws-node-typescript-multi-instance-lambda-foo-dev-hello` executed successfully.\",\n  \"input\": {}\n}"
}
```

### Removal

"--param" is also required to run the `sls remove` command to tear down the CloudFormation stack associated with a specific instance.

```bash
npx sls remove --region ap-southeast-2 --param="instance=foo"
```

## Acknowledgements

- [This comment](https://github.com/serverless/serverless/issues/9361#issuecomment-884602588) by [**@rdemorais**](https://github.com/rdemorais) on Serverless issue [#9361](https://github.com/serverless/serverless/issues/9361).
- [**@billkidwell**](https://github.com/billkidwell)'s [Simple Kinesis Example](https://github.com/serverless/examples/tree/v3/aws-node-typescript-kinesis).
