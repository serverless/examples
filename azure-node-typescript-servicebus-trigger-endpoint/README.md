<!--
title: 'Using Azure Service Queue to trigger Azure Function'
description: 'This example demonstrates how to trigger an Azure function when a message arrives in Service Bus Queue'
layout: Doc
framework: v1
platform: AZURE
language: typescript
authorLink: 'https://github.com/Kurshit'
authorName: 'Kurshit Kukreja'
authorAvatar: 'https://avatars0.githubusercontent.com/u/30333780?s=400&u=53af20c512014f0b7250ed6ac003be1c5cfbddd7&v=4'
-->
# Create and Deploy Azure Function using Service Bus Queue as a trigger event.

This example demonstrates how to create and deploy an Azure Function which has Service Bus Queue as its trigger event using Serverless Framework.

## Use-cases

- This app will create and deploy an Azure Function which would be triggered when a message would arrive in a Service Bus Queue.
- This app also exposes an http endpoint to send a sample message to service bus queue.

## How it works

The serverless.yml would define an Azure Function handler with its trigger event as Service Bus and by providing necessary details about the service bus - queue name and connection string. Whenever a message would arrive in defined service bus queue, an azure function would be invoked and sent message would be processed in its handler.

To send a sample message on defined service bus queue, `serverless.yml` declares one sample http POST end point. This can be used to send a message on defined service bus queue.


## Setup

#### 1. Install Project Dependencies
`npm install` in this directory to download the modules from `package.json`.

#### 2.  To run the azure function locally using `serverlesss offline --stage dev`

The `serverless offline --stage dev` command will let you try and test your azure function locally.

Before running this command -
1.  You need to create a service bus queue on Azure Portal and provide the connection string in `serverless.yml` as an environment variable and refer this environment variable name in "connection" hook.

```yml
# in serverless.yml
provider:
  environment:
	  VARIABLE_SBUS_CONNECTION_STRING: 'Endpoint=sb://.......'
....
....
....

events:
  - serviceBus:
	x-azure-settings:
		queueName: '<YourServiceBusQueueName>'
		accessRights: manage
		connection: VARIABLE_SBUS_CONNECTION_STRING
```
2. Define Service Bus details - Connection string and queuename-  in `.env.dev file`. This connection string  & queuename would be used in `serviceBusMessageSender.ts` file to send sample message to service bus queue.

```yml
# in .env.dev file

SERVICEBUS_CS='Endpoint=sb://.....'
SERVICEBUS_QUEUE_NAME=<YourServiceBusQueueName>
```
Once this is done, run the command `serverless offline --stage dev`.

The console would show the output message which should look something like this - 

```bash
Application started. Press Ctrl+C to shut down.

Functions:

        sendMessage: [POST] http://localhost:7071/api/v3/send

        sampleHandler: serviceBusTrigger

For detailed output, run func with --verbose flag.
[2020-10-30T07:54:23.803] Worker process started and initialized.
```

####  3. To deploy the azure function using `serverless deploy --stage dev`

1. Provide the appropriate Service Bus details in `serverless.yml` & `.env.dev` file as mentioned in step #2.

2. Provide the desired azure `resourceGroup`, `subscriptionId`,`region` and `stage` values in `serverless.yml` to deploy the app on Azure.

Once above steps are done, run the command `serverless deploy --env dev`.

The console would show the output message which should look something like this - 

```bash
Serverless: Finished uploading blob
Serverless: -> Function package uploaded successfully
Serverless: Deployed serverless functions:
Serverless: -> Function App not ready. Retry 0 of 30...
Serverless: -> Function App not ready. Retry 1 of 30...
Serverless: -> Function App not ready. Retry 2 of 30...
Serverless: -> sendMessage: [POST] sls-<region>-dev-service-bus-trigger-example.azurewebsites.net/api/api/v3/send
```
####  4. To test the sample end point and invoke the function -

1. Send a sample message on service bus using `../api/api/v3/send` end point: 

Send a POST request on `../api/api/v3/send` endpoint with following payload - 

```bash
{
    "id": 101,
    "name": "AnyName",
    "gender": "Male/Female",
    "age": 30
}

```

When the service bus receives the above sample message, it will invoke another azure function - `sampleHandler` and it shall print the above payload on console.
The console would show the output message which should look something like this -

```bash

[2020-10-30T08:20:07.998] Executed 'Functions.sendMessage' (Succeeded, Id=f08ed5e7-5bd2-4c7c-8054-e23cad3dbb82, Duration=317ms)
[2020-10-30T08:20:11.001] Executing 'Functions.sampleHandler' (Reason='New ServiceBus message detected on 'myqueuename'.', Id=abbb78d1-a19c-4ea7-b8a7-3ae6e9c6e66d)
[2020-10-30T08:20:11.005] Trigger Details: MessageId: 83840f43a8824791bc2c9624d68ea1c2, DeliveryCount: 2, EnqueuedTime: 10/30/2020 8:20:10 AM, LockedUntil: 10/30/2020 8:20:40 AM, SessionId: (null)
[2020-10-30T08:20:11.023] [2020-10-30T13:50:11.022+05:30][INFO][src\controller\triggerFunctionController.ts]: Azure function has been trigged with message {"id":10,"name":"Kurshit","gender":"Male","age":27} in service bus
[2020-10-30T08:20:11.026] Executed 'Functions.sampleHandler' (Succeeded, Id=abbb78d1-a19c-4ea7-b8a7-3ae6e9c6e66d, Duration=39ms)

```