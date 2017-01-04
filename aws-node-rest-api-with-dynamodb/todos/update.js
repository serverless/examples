'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  // validation
  if (typeof data.text !== 'string' || typeof data.checked !== 'boolean') {
    console.error('Validation Failed'); // eslint-disable-line no-console
    callback(new Error('Couldn\'t create the todo item.'));
    return;
  }

  const params = {
    TableName: 'todos',
    Key: {
      id: event.pathParameters.id
    },
    ExpressionAttributeNames: {
      '#c1': 'createdAt',
      '#c2': 'updatedAt',
      '#c3': 'text',
      '#c4': 'checked'
    },
    ExpressionAttributeValues: {
      ':d2': timestamp,
      ':d3': data.text,
      ':d4': data.checked
    },
    UpdateExpression: 'SET #c1 = if_not_exists(#c1, :d2), #c2 = :d2, #c3 = :d3, #c4 = :d4',
    ReturnValues: 'ALL_NEW'
  };

  // update the todo in the database
  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error); // eslint-disable-line no-console
      callback(new Error('Couldn\'t update the todo item.'));
      return;
    }

    // create a resonse
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};
