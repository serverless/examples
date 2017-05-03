'use strict';

const AWS = require('aws-sdk');

const rek = new AWS.Rekognition();

class ImageAnalyser {

  static getImageLabels(s3Config) {
    const params = {
      Image: {
        S3Object: {
          Bucket: s3Config.bucket,
          Name: s3Config.imageName,
        },
      },
      MaxLabels: 10,
      MinConfidence: 50,
    };

    console.log(`Analyzing file: https://s3.amazonaws.com/${s3Config.bucket}/${s3Config.imageName}`);

    return new Promise((resolve, reject) => {
      rek.detectLabels(params, (err, data) => {
        if (err) {
          return reject(new Error(err));
        }
        console.log('Analysis labels:', data.Labels);
        return resolve(data.Labels);
      });
    });
  }
}

module.exports = ImageAnalyser;
