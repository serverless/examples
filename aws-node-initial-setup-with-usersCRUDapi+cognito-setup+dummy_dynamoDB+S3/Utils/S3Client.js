const AWS = require("aws-sdk");
const region = process.env.REGION;
AWS.config.update({ region });
const s3 = new AWS.S3();

function S3GetItem(params) {
  return new Promise((resolve, reject) =>
    s3.getObject(params, (err, data) => {
      err ? reject(err) : resolve(data);
    })
  );
}

function S3PutItem(params) {
  return new Promise((resolve, reject) =>
    s3.putObject(params, (err, data) => {
      err ? reject(err) : resolve(data);
    })
  );
}

function S3DeleteItem(params) {
  return new Promise((resolve, reject) =>
    s3.deleteObject(params, (err, data) => {
      err ? reject(err) : resolve(data);
    })
  );
}
module.exports = { S3GetItem, S3PutItem, S3DeleteItem };
