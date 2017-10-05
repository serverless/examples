# AWS Node Helloworld Tested

A simple example showing a http helloworld including a unit test.

## Install 

    $ serverless install -u https://github.com/serverless/examples/tree/master/aws-node-helloworld-tested -n helloworld

## Deploy

    $ cd helloworld
    $ serverless deploy
    Serverless: Packaging service...
    Serverless: Creating Stack...
    Serverless: Checking Stack create progress...
    .....
    Serverless: Stack create finished...
    Serverless: Uploading CloudFormation file to S3...
    Serverless: Uploading artifacts...
    Serverless: Uploading service .zip file to S3 (1.36 KB)...
    Serverless: Updating Stack...
    Serverless: Checking Stack update progress...
    ...............................
    Serverless: Stack update finished...
    Service Information
    service: hellworld
    stage: dev
    region: us-east-1
    api keys:
        None
    endpoints:
        GET - https://<someid>.execute-api.us-east-1.amazonaws.com/dev/hello-world
    functions:
        helloWorld: hellworld-dev-helloWorld

## Testout endpoint

    $ curl -sL $(sls info |grep -oEi 'http.*') | jq .message
    "Go Serverless v1.0! Your function executed successfully!"


## Run local unit tests

     npm test