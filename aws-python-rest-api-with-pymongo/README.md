<!--
title: 'AWS Python Rest API with Pymongo'
description: 'AWS Python Rest API with Pymongo Example'
layout: Doc
framework: v1
platform: AWS
language: python
authorLink: 'https://github.com/gsweene2'
authorName: 'Garrett Sweeney'
authorAvatar: ''
-->
# aws-python-rest-api-with-pymongo

## Create the Mongo Atlas backend

1. Follow `Part 1: Cluster Creation` of [this artice](https://medium.com/swlh/creating-a-mongodb-cluster-and-inserting-a-document-with-python-ac90cc9d979c) to create a cluster on Mongo Atlas' Free Tier.

## Deploy the Serverless API to AWS

1. Install Serverless

    ```
    npm install -g serverless
    ```

2. Install `serverless-python-requirements`

    ```
    npm i --save serverless-python-requirements
    ```

3. Define necessary environment variables

    Append this to your ~/.bash_profile

    ```
    export MONGO_DB_USER=
    export MONGO_DB_PASS=
    export MONGO_DB_NAME=SampleDatabase
    export MONGO_COLLECTION_NAME=SampleCollection
    export MONGO_DB_URL=
    ```

4. Deploy the API

    ```
    sls deploy
    ```

    Your results should look something like this:
    ```
    Serverless: Stack update finished...
    Service Information
    service: serverless-pymongo-item-api
    stage: dev
    region: us-east-1
    stack: serverless-pymongo-item-api-dev
    resources: 28
    api keys:
      None
    endpoints:
      POST - https://0xfyi15qci.execute-api.us-east-1.amazonaws.com/dev/item
      GET - https://0xfyi15qci.execute-api.us-east-1.amazonaws.com/dev/item
      GET - https://0xfyi15qci.execute-api.us-east-1.amazonaws.com/dev/item/{id}
      DELETE - https://0xfyi15qci.execute-api.us-east-1.amazonaws.com/dev/item/{id}
    functions:
      create: serverless-pymongo-item-api-dev-create
      list: serverless-pymongo-item-api-dev-list
      get: serverless-pymongo-item-api-dev-get
      delete: serverless-pymongo-item-api-dev-delete
    layers:
      None
    Serverless: Removing old service artifacts from S3...
    Serverless: Run the "serverless" command to setup monitoring, troubleshooting and testing.
    ```

## Test the API by Creating and Querying items

Substitute your endpoints into these curl commands to test the Create, Read, and Delete operations

### CREATE

```
curl --request POST \
  --url https://0xfyi15qci.execute-api.us-east-1.amazonaws.com/dev/item \
  --header 'content-type: application/json' \
  --data '{
	"attribute_1": "Pet",
	"attribute_2": "Rock"
}'
```

#### Expected Response

204 status

```
{
  "_id": "c6f03ca0-f792-11e9-9534-260a4b91bfe9",
  "data": {
    "attribute_1": "Pet",
    "attribute_2": "Rock"
  }
}
```

### GET

```
curl --request GET \
  --url https://0xfyi15qci.execute-api.us-east-1.amazonaws.com/dev/item/c6f03ca0-f792-11e9-9534-260a4b91bfe9 \
  --header 'content-type: application/json'
```

#### Expected Response

200 status

```
{
  "_id": "c6f03ca0-f792-11e9-9534-260a4b91bfe9",
  "data": {
    "attribute_1": "Pet",
    "attribute_2": "Rock"
  }
}
```

### LIST

``` 
curl --request GET \
  --url https://0xfyi15qci.execute-api.us-east-1.amazonaws.com/dev/item \
  --header 'content-type: application/json'
```

### Expected Response

200 status

``` 
{
  "response_items": [
    {
      "_id": "c6f03ca0-f792-11e9-9534-260a4b91bfe9",
      "data": {
        "attribute_1": "Pet",
        "attribute_2": "Rock"
      }
    },
    {
      "_id": "717c5f36-f799-11e9-a921-1e0e685be73c",
      "data": {
        "attribute_1": "Pete",
        "attribute_2": "Rock"
      }
    }
  ],
  "filter": null
}
```

## Delete

``` 
curl --request DELETE \
  --url https://0xfyi15qci.execute-api.us-east-1.amazonaws.com/dev/item/c6f03ca0-f792-11e9-9534-260a4b91bfe9 \
  --header 'content-type: application/json'
```

### Expected Response

204 status

