const sesv2 = require('@aws-sdk/client-sesv2');

const ses = new sesv2.SESv2Client(!process.env.IS_OFFLINE
  ? {
    // Generally will be configured automatically in AWS Lambda, but you
    // could override the region/endpoint/credentials here if you wished
  }
  : {
    endpoint: 'http://localhost:8005',
    region: 'aws-ses-v2-local',
    credentials: { accessKeyId: 'ANY_STRING', secretAccessKey: 'ANY_STRING' },
  });

const main = async () => {
  await ses.send(new sesv2.SendEmailCommand({
    FromEmailAddress: 'sender@example.com',
    Destination: { ToAddresses: ['receiver@example.com'] },
    Content: {
      Simple: {
        Subject: { Data: 'This is the subject' },
        Body: { Text: { Data: 'This is the email contents' } },
      },
    },
  }));
};

module.exports = {
  main,
};
