'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: 'todos',
};

module.exports = (event, context, callback) => {
  // fetch all todos from the database
  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error); // eslint-disable-line no-console
      callback({ statusCode: 500 });
      return;
    }

    // create a resonse
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
    callback(response);
  });
};
