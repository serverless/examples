import { TranscribeClient, StartTranscriptionJobCommand } from '@aws-sdk/client-transcribe';

const transcribeService = new TranscribeClient({});

export const transcribe = async (event) => {
  const records = event.Records;

  const transcribingPromises = records.map((record) => {
    const recordUrl = [
      'https://s3.amazonaws.com',
      process.env.S3_AUDIO_BUCKET,
      record.s3.object.key,
    ].join('/');

    const TranscriptionJobName = record.s3.object.key;

    return transcribeService.send(
      new StartTranscriptionJobCommand({
        LanguageCode: process.env.LANGUAGE_CODE,
        Media: { MediaFileUri: recordUrl },
        MediaFormat: 'wav',
        TranscriptionJobName,
        MediaSampleRateHertz: 8000, // normally 8000 if you are using wav file
        OutputBucketName: process.env.S3_TRANSCRIPTION_BUCKET,
      })
    );
  });

  await Promise.all(transcribingPromises);
  return { message: 'Start transcription job successfully' };
};
