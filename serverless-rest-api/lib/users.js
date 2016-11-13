'use strict';

const config = require('./utils/config')(); // Load ENV vars and config

const uuid = require('uuid');
const Res = require('./utils/res');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: process.env.appRegion
});

const table = 'users-' + process.env.appStage;

// Users - Create
module.exports.create = (event, ctx, cb) => {

  let res = new Res(cb);

  // Santize event type
  if (typeof event === 'string') event = JSON.parse(event);

  const data = event;
  data.id = uuid.v1();
  data.createdAt = new Date().getTime();

  // Validate
  if (!data.email) {
    res.status(400).cors().body({ error: 'Email address is required' }).end();
  }

  const params = {
    TableName: table,
    Item: data
  };

  return dynamoDb.put(params, (error, result) => {
    if (error) {
      res.status(400).cors().body({ error: error }).end();
    } else {
      res.status(200).cors().body(data).end();
    }
  });
};
