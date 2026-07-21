<!--
title: 'GraphQL query endpoint in NodeJS on AWS with DynamoDB'
description: 'A single-module GraphQL endpoint with query and mutation functionality.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/gismoranas'
authorName: 'Gismo Ranas'
authorAvatar: 'https://avatars0.githubusercontent.com/u/5903107?v=4&s=140'
-->

# GraphQL query endpoint in NodeJS on AWS with DynamoDB

GraphQL is cool, and the `graphql` module makes it easy to rapidly create a GraphQL service that validates queries. We use GraphQL at Serverless to query our backend services, and we love how well it fits into the serverless paradigm.

Let's see how easy it is to use GraphQL with the Serverless Framework. In this example, I'll be targeting AWS. Let's build a simplistic version of an API that might be used by the front-end to retrieve a dynamic message to display in the UI, in this case greeting the user by name.

Start by initializing a project and installing the [graphql](https://www.npmjs.com/package/graphql) module.
```sh
$ npm init
$ npm install --save graphql
```

Now we can use it in `handler.js`, where we declare a schema and then use it to serve query requests.
```js
/* handler.js */
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

// This method just inserts the user's first name into the greeting message.
const getGreeting = firstName => `Hello, ${firstName}.`;

// Here we declare the schema and resolvers for the query
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType', // an arbitrary name
    fields: {
      // the query has a field called 'greeting'
      greeting: {
        // we need to know the user's name to greet them
        args: { firstName: { name: 'firstName', type: new GraphQLNonNull(GraphQLString) } },
        // the greeting message is a string
        type: GraphQLString,
        // resolve to a greeting message
        resolve: (parent, args) => getGreeting(args.firstName),
      },
    },
  }),
});

// We want to make a GET request with ?query=<graphql query>
// The event properties are specific to AWS. Other providers will differ.
export const query = async (event) => {
  const result = await graphql({ schema, source: event.queryStringParameters.query });
  return { statusCode: 200, body: JSON.stringify(result) };
};
```

Pretty simple! To deploy it, define a service in `serverless.yml`, and set the handler to service HTTP requests.
```yml
# serverless.yml
service: graphql-api

functions:
  query:
    handler: handler.query
    events:
      - http:
          path: query
          method: get
```
Now we can bring it to life:
```sh
$ serverless deploy
# Deploying "graphql-api" to stage "dev" (us-east-1)
#
# ✔ Service deployed to stack graphql-api-dev (45s)
#
# endpoints:
#   GET - https://9qdmq5nvql.execute-api.us-east-1.amazonaws.com/query
# functions:
#   query: graphql-api-dev-query (1.1 kB)

$ curl -G 'https://9qdmq5nvql.execute-api.us-east-1.amazonaws.com/query' --data-urlencode 'query={greeting(firstName: "Jeremy")}'
# {"data":{"greeting":"Hello, Jeremy."}}
```

In the real world, virtually any service that does something valuable has a data store behind it. For example, suppose users have nicknames that should appear in the greeting message. We need a database to store the nicknames, and we can expand our GraphQL API to update them.

Let's start by adding a database to the resource definitions in `serverless.yml`. We need a table keyed on the user's first name, which we define using CloudFormation, as well as some provider configuration to allow our function to access it.
```yml
# add to serverless.yml

provider:
  name: aws
  runtime: nodejs24.x
  architecture: arm64
  environment:
    DYNAMODB_TABLE: ${self:service}-${sls:stage}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:GetItem
            - dynamodb:UpdateItem
          Resource: !GetAtt NicknamesTable.Arn

resources:
  Resources:
    NicknamesTable:
      Type: 'AWS::DynamoDB::Table'
      Properties:
        AttributeDefinitions:
          - AttributeName: firstName
            AttributeType: S
        KeySchema:
          - AttributeName: firstName
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
        TableName: ${self:provider.environment.DYNAMODB_TABLE}
```

We need to run `serverless deploy` again to update the changes made in `serverless.yml`:

```
$ serverless deploy
```

To use it we need the [`@aws-sdk/client-dynamodb`](https://www.npmjs.com/package/@aws-sdk/client-dynamodb) and [`@aws-sdk/lib-dynamodb`](https://www.npmjs.com/package/@aws-sdk/lib-dynamodb) packages (AWS SDK for JavaScript v3).
```sh
$ npm install --save @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

Include these in our handler, and then we can get to work.
```js
// add to handler.js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
```

Before, we defined a method that just returned a string value for the greeting message. However, the GraphQL library can also use Promises as resolvers, so we `await` the DynamoDB `GetCommand` to check the database for a nickname for the user.

```js
// add to handler.js

// replace previous implementation of getGreeting
const getGreeting = async (firstName) => {
  const result = await client.send(new GetCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Key: { firstName },
  }));
  const name = result.Item ? result.Item.nickname : firstName;
  return `Hello, ${name}.`;
};

// add method for updates
const changeNickname = async (firstName, nickname) => {
  await client.send(new UpdateCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Key: { firstName },
    UpdateExpression: 'SET nickname = :nickname',
    ExpressionAttributeValues: {
      ':nickname': nickname,
    },
  }));
  return nickname;
};
```

You can see here that we added a method `changeNickname`, but the GraphQL API is not yet using it. We need to declare a mutation that the front-end can use to perform updates. We previously only added a `query` declaration to the schema. Now we need a `mutation` as well.

```js
// alter schema
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    /* unchanged */
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType', // an arbitrary name
    fields: {
      changeNickname: {
        args: {
          // we need the user's first name as well as a preferred nickname
          firstName: { name: 'firstName', type: new GraphQLNonNull(GraphQLString) },
          nickname: { name: 'nickname', type: new GraphQLNonNull(GraphQLString) }
        },
        type: GraphQLString,
        // update the nickname
        resolve: (parent, args) => changeNickname(args.firstName, args.nickname)
      }
    }
  })
})
```

After these changes, we can make the greeting request again and receive the same result as before.
```sh
$ curl -G 'https://9qdmq5nvql.execute-api.us-east-1.amazonaws.com/dev/query' --data-urlencode 'query={greeting(firstName: "Jeremy")}'
# {"data":{"greeting":"Hello, Jeremy."}}
```
But if I want the API to call me "Jer", I can update the nickname for "Jeremy".
```sh
$ curl -G 'https://9qdmq5nvql.execute-api.us-east-1.amazonaws.com/dev/query' --data-urlencode 'query=mutation {changeNickname(firstName:
 "Jeremy", nickname: "Jer")}'
$ curl -G 'https://9qdmq5nvql.execute-api.us-east-1.amazonaws.com/dev/query' --data-urlencode 'query={greeting(firstName: "Jeremy")}'
# {"data":{"greeting":"Hello, Jer."}}
```

The API will now call anyone named "Jeremy" by the nickname "Jer". This kind of separation of concerns lets you build front-ends and services that offload logic into back-ends that use abstract data access and processing behind one, strongly typed, validated, uniform contract that comes with rich versioning and deprecation strategies.

To deploy this service yourself, clone this repository and deploy it with the Serverless Framework. Happy building!
