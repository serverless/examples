'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: 'todos',
    Key: {
      id: event.pathParameters.id,
    },
  };

  // fetch all todos from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error); // eslint-disable-line no-console
      callback(new Error('Couldn\'t fetch the todo item.'));
      return;
    }

    // create a resonse
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};
