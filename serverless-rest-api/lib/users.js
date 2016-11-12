'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

let Res = require('./utils/res');

// Users - Create
module.exports.create = (event, ctx, cb) => {

  let res = new Res(cb);

  // Santize event type
  if (typeof event === 'string') event = JSON.parse(event);

  const data = event;

  data.id = uuid.v1();
  data.updatedAt = new Date().getTime();

  const params = {
    TableName: 'todos',
    Item: data
  };

  // Return
  res.status(200).cors().body({ test: 'data' }).end();

  // return dynamoDb.put(params, (error, data) => {
  //   console.log(error, data)
  //
  //   utils.res(cb, { data: "data!" });
  //   // if (error) {
  //   //   callback(error);
  //   // }
  //   // callback(error, params.Item);
  // });
};
