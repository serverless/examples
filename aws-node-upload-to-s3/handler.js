'use strict';

const fetch = require('node-fetch');
const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(require('bluebird'));


const s3 = new AWS.S3();

module.exports.upload = (event, context, callback) => {
  fetch(event.image_url)
    .then(res => s3.putObject({ Bucket: event.bucket, Key: event.key, Body: res.body }).promise())
    .then((res) => {
      callback(null, res);
    }).catch((err) => {
      callback(err, null);
    });
};
