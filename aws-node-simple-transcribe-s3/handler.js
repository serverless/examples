'use strict';

const awsSdk = require('aws-sdk');

const transcribeService = new awsSdk.TranscribeService();

module.exports.transcribe = (event, context, callback) => {
  const records = event.Records;

  const transcribingPromises = records.map((record) => {
    const recordUrl = [
      'https://s3.amazonaws.com',
      process.env.S3_AUDIO_BUCKET,
      record.s3.object.key,
    ].join('/');

    const TranscriptionJobName = record.s3.object.key;

    return transcribeService.startTranscriptionJob({
      LanguageCode: process.env.LANGUAGE_CODE,
      Media: { MediaFileUri: recordUrl },
      MediaFormat: 'wav',
      TranscriptionJobName,
      MediaSampleRateHertz: 8000, // normally 8000 if you are using wav file
      OutputBucketName: process.env.S3_TRANSCRIPTION_BUCKET,
    }).promise();
  });

  Promise.all(transcribingPromises)
    .then(() => {
      callback(null, { message: 'Start transcription job successfully' });
    })
    .catch(err => callback(err, { message: 'Error start transcription job' }));
};
