'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  // TODO add a check that body contains the paramter "text" and it's a string
  const params = {
    TableName: 'todos',
    Item: {
      id: uuid.v1(),
      text: data.text,
      checked: false,
      createdAt: timestamp,
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
