'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = (event, context, callback) => {
  const params = {
    TableName: 'todos',
    Key: {
      id: event.pathParameters.id,
    },
  };

  // write the todo to the database
  dynamoDb.delete(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error); // eslint-disable-line no-console
      callback({ statusCode: 500 });
      return;
    }

    // create a resonse
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Key),
    };
    callback(response);
  });
};
