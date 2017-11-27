<!--
title: AWS Serverless REST API with DynamoDB store and presigned URLs example in Python 3.6.
description: This example demonstrates how to setup a RESTful Web Service allowing you to create, list, get, update and delete Assets. DynamoDB is used to store the data.
layout: Doc
-->
# Serverless REST API
This example demonstrates how to setup a [RESTful Web Service](https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services) 
using [Presigned URLs](http://boto3.readthedocs.io/en/latest/guide/s3.html?highlight=presigned#generating-presigned-urls) 
to manage asset uploads and downloads. 

The initial POST creates an asset entry in dynamo and returns a presigned upload URL. 
This is used to upload the asset without needing any credentials. 
An s3 event triggers another lambda method to mark the asset as "RECEIVED".
One can then initiate a PUT to the asset's REST path to mark it as "UPLOADED"

To download an asset, do a GET to the asset path to get a presigned download URL with an optional TTL.
This URL can be used to retrieve the asset with no additional credentials. 

Also provides "LIST" and "DELETE" methods. 

DynamoDB is used to store the index and tracking data referring to the assets on s3.
This is just an example and of course you could use any data storage as a backend.

## Structure
This service has a separate directory for all the assets operations. 
For each operation exactly one file exists e.g. `assets/delete.py`. In each of these files there is exactly one function defined.
### Model
The idea behind the `assets` directory is that in case you want to create a service containing multiple resources e.g. users, notes, 
comments you could do so in the same service. 
While this is certainly possible you might consider creating a separate service for each resource. 
It depends on the use-case and your preference.
### API GW Integration model
All methods use `lambda` integration as that reduces the API GW interference in the payload.
### Logging
The log_cfg.py is an alternate way to setup the python logging to be more friendly wth AWS lambda.
The lambda default logging config is to not print any source file or line number which makes it harder to correleate with the source.

Adding the import:
```python
    from log_cfg import logger
```
at the start of every event handler ensures that the format of the log messages are consistent, customizable and all in one place. 

Default format uses:
```python
'%(asctime)-15s %(process)d-%(thread)d %(name)s [%(filename)s:%(lineno)d] :%(levelname)8s: %(message)s'
```

### Notes
Initial scaffold copied from the aws-python-rest-api-with-pynamodb example.

The PUT method to mark the asset as UPLOADED is somewhat redundant as the S3 event that marks uploads as RECEIVED should be sufficient for most cases.
However the goal was to use a PUT method to mark it received, so the PUT marks a RECEIVED asset as UPLOADED.
That said, there is no distinction between UPLOADED vs RECEIVED anywhere in the example.

The DELETE method does a `soft delete` which marks the asset as deleted without removing the s3 key. 
If the file on s3 is deleted, an event is generated which does fully delete the asset in dynamo as well.

## Setup

```bash
npm install
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
%> sls deploy                                                                               
Serverless: Parsing Python requirements.txt
Serverless: Installing required Python packages for runtime python3.6...
Serverless: Linking required Python packages...
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Unlinking required Python packages...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (7.14 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
............................................
Serverless: Stack update finished...
Service Information
service: aws-python-pynamodb-s3-sigurl
stage: dev
region: us-east-1
stack: aws-python-pynamodb-s3-sigurl-dev
api keys:
  None
endpoints:
  POST - https://1xith51inb.execute-api.us-east-1.amazonaws.com/dev/asset
  GET - https://1xith51inb.execute-api.us-east-1.amazonaws.com/dev/asset
  GET - https://1xith51inb.execute-api.us-east-1.amazonaws.com/dev/asset/{asset_id}
  PUT - https://1xith51inb.execute-api.us-east-1.amazonaws.com/dev/asset/{asset_id}
  DELETE - https://1xith51inb.execute-api.us-east-1.amazonaws.com/dev/asset/{asset_id}
functions:
  create: aws-python-pynamodb-s3-sigurl-dev-create
  bucket: aws-python-pynamodb-s3-sigurl-dev-bucket
  list: aws-python-pynamodb-s3-sigurl-dev-list
  get: aws-python-pynamodb-s3-sigurl-dev-get
  update: aws-python-pynamodb-s3-sigurl-dev-update
  delete: aws-python-pynamodb-s3-sigurl-dev-delete
```

## Usage

You can create, retrieve, update, or delete assets with the following commands:
The $URL is the base URL specified in the POST endpoint above.

`jsonpp` used to format the output for visibility but is not required for use.

### Get an asset pre-signed upload URL

```bash
%> curl -sX POST $URL | jsonpp
{
  "statusCode": 201,
  "body": {
    "upload_url": "<SIGNED-URL>",
    "id": "1a5ea69a-d30c-11e7-90d0-129b5a655d2d"
  }
}
```

### Upload a file to the URL
```bash
%> curl -sX PUT --upload-file file.txt "<SIGNED_URL>"
```

### Upload a file after pre-signed URL has expired
```bash
%> curl -sX PUT --upload-file file.txt "<SIGNED-URL>"
<?xml version="1.0" encoding="UTF-8"?>
<Error>
    <Code>AccessDenied</Code>
    <Message>Request has expired</Message>
    <Expires>2017-11-27T01:03:04Z</Expires>
    <ServerTime>2017-11-27T01:05:41Z</ServerTime>
    <RequestId>D4EFA3C1A8DDD525</RequestId>
    <HostId>vS12oM24ZidzjG0JZon/y/8XD8whCKD/0JZappUNOekOJ3Eqp10Q5ne0emPVM/Mx6K1lYr0bi6c=</HostId>
</Error>
```

### Mark asset as uploaded
```bash
%> curl -sX PUT "$URL/1a5ea69a-d30c-11e7-90d0-129b5a655d2d" | jsonpp
{
  "statusCode": 202,
  "body": {
    "status": "UPLOADED"
  }
}
```

### Get download URL for asset:
```bash
%> curl -sX GET "$URL/1a5ea69a-d30c-11e7-90d0-129b5a655d2d" | jsonpp
{
  "statusCode": 202,
  "body": {
    "download_url": "<SIGNED-URL>"
  }
}
```

### List all Assets
```bash
%> curl -sX GET "$URL" | jsonpp                                                             {
  "statusCode": 200,
  "body": {
    "items": [
      {
        "asset_id": "312aba96-d30f-11e7-b004-129b5a655d2d",
        "createdAt": "2017-11-27T01:05:21.830944+0000",
        "state": "UPLOADED",
        "updatedAt": "2017-11-27T01:07:05.311962+0000"
      },
      {
        "asset_id": "0add1bcc-d30f-11e7-b004-129b5a655d2d",
        "createdAt": "2017-11-27T01:05:21.830944+0000",
        "state": "UPLOADED",
        "updatedAt": "2017-11-27T01:06:19.413445+0000"
      },
      {
        "asset_id": "57226e20-d30e-11e7-bda4-129b5a655d2d",
        "createdAt": "2017-11-27T01:00:20.296693+0000",
        "state": "CREATED",
        "updatedAt": "2017-11-27T01:02:57.750625+0000"
      }
    ]
  }
}
```

### Get one Asset download URL

```bash
%> curl -sX GET "$URL/57226e20-d30e-11e7-bda4-129b5a655d2d" | jsonpp
{
  "statusCode": 202,
  "body": {
    "download_url": "<SIGNED-URL>"
  }
}

```
The returned URL is all that's needed to retrieve the asset file.

### Download asset
Use the `download_url` returned from the above GET
```bash
%> %> curl -sX GET "<SIGNED_URL>"  --output file.txt
```

### Download asset with expired URL
Use the `download_url` returned from the above GET
```bash
%> curl -sX GET "<SIGNED_URL>"
<?xml version="1.0" encoding="UTF-8"?>
<Error>
    <Code>AccessDenied</Code>
    <Message>Request has expired</Message>
    <Expires>2017-11-27T03:15:54Z</Expires>
    <ServerTime>2017-11-27T03:17:25Z</ServerTime>
    <RequestId>09B6B5DD49895A40</RequestId>
    <HostId>mlN7TDikYBhehryCiGXtROuNCZL+/50kfvA0Ui2NP2JPVyTCY9hIbQxlsayB2rdxefhHfKn77mI=</HostId>
</Error>
```

### Delete an asset
```bash
%> curl -sX DELETE "$URL/312aba96-d30f-11e7-b004-129b5a655d2d" | jsonpp
{
  "statusCode": 204
}
```

## Scaling

### AWS Lambda

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. 
The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. 
To increase this limit above the default, 
follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).

### AWS Lambda Edge

Lambda is constrained to one region. The One can configure AWS cloudfront to pass events to lambda instances in the closest region using 
[Lambda Edge](https://aws.amazon.com/about-aws/whats-new/2017/07/lambda-at-edge-now-generally-available/).

### DynamoDB

When you create a table, you specify how much provisioned throughput capacity you want to reserve for reads and writes. 
DynamoDB will reserve the necessary resources to meet your throughput needs while ensuring consistent, low-latency performance. 
You can change the provisioned throughput and increasing or decreasing capacity as needed.

This is can be done via settings in the `serverless.yml`.

```yaml
  ProvisionedThroughput:
    ReadCapacityUnits: 1
    WriteCapacityUnits: 1
```
Dynamo now also supports an auto-scaling option to eliminate the need for manual capacity scaling.

In case you expect a lot of traffic fluctuation we recommend to checkout this guide on how to auto scale DynamoDB [https://aws.amazon.com/blogs/aws/auto-scale-dynamodb-with-dynamic-dynamodb/](https://aws.amazon.com/blogs/aws/auto-scale-dynamodb-with-dynamic-dynamodb/)

