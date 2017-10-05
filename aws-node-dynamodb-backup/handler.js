'use strict';

const aws = require('aws-sdk');

const s3 = new aws.S3({ region: 'ap-southeast-1' });

module.exports.backup = (event, context, callback) => {
  const records = event.Records;

  Promise.all(records.map((record) => {
    const keysList = Object.keys(record.dynamodb.Keys).map((key) => {
      const keyDefinition = record.dynamodb.Keys[key];
      const type = Object.keys(keyDefinition)[0];
      const value = keyDefinition[type];
      return value;
    });

    const keysString = keysList.join('/');
    const image = aws.DynamoDB.Converter.output({ M: record.dynamodb.NewImage });

    return s3.putObject({
      Bucket: process.env.BUCKET,
      Key: `${process.env.PREFIX}/${process.env.TABLE}/${keysString}/image.json`,
      Body: JSON.stringify(image),
    }).promise()
      .then((response) => {
        console.log(`${keysString} snapshot done`, response);
      })
      .catch((err) => {
        console.error('Error', err);
      });
  }))
    .then(v => callback(null, v), callback);
};
