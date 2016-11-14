'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

// Users - Create
module.exports.create = (req, res) => {

  req.body.id = uuid.v1();
  req.body.createdAt = new Date().getTime();

  // Validate
  if (!req.body.email) {
    res.status(400).cors().body({ error: 'Email address is required' }).end();
  }

  // TODO: Separate provider logic from business logic into a "db" abstraction
  const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: req.region
  });

  const params = {
    TableName: 'users-' + req.stage,
    Item: req.body
  };

  return dynamoDb.put(params, (error, result) => {
    if (error) {
      res.status(400).cors().body({ error: error }).end();
    } else {
      res.status(200).cors().body(req.body).end();
    }
  });
};

// Users - Show
module.exports.show = function(req, res) {
  res.body({ message: 'success!' }).end()
}

// Users - Update
module.exports.update = function(req, res) {
  res.body({ message: 'success!' }).end()
}

// Users - Delete
module.exports.delete = function(req, res) {
  res.body({ message: 'success!' }).end()
}
