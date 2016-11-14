'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  // TODO add a check that body contains the paramter "text" and it's a string
  // check that "checked exists"
  const params = {
    TableName: 'todos',
    Item: {
      id: event.pathParameters.id,
      text: data.text,
      checked: Boolean(data.checked),
      updatedAt: timestamp,
    },
  };

  // write the todo to the database
  dynamoDb.put(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error); // eslint-disable-line no-console
      callback({ statusCode: 500 });
      return;
    }

    // create a resonse
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    callback(response);
  });
};
