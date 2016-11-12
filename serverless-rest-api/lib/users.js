'use strict';

const config = require('./utils/config')(); // Load ENV vars and config

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const Res = require('./utils/res');

const table = 'users-' + process.env.appStage;

// Users - Create
module.exports.create = (event, ctx, cb) => {

  let res = new Res(cb);

  // Santize event type
  if (typeof event === 'string') event = JSON.parse(event);

  const data = event;

  data.id = uuid.v1();
  data.updatedAt = new Date().getTime();

  const params = {
    TableName: table,
    Item: data
  };
  
  console.log(params)
  return dynamoDb.put(params, (error, data) => {
    if (error) {
      console.log(error)
      res.status(400).cors().body({ message: error }).end();
    } else {
      res.status(200).cors().body({ test: 'data' }).end();
    }
  });
};
