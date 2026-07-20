import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({});

export const addNote = async (event) => {
  const data = JSON.parse(event.body);
  if (typeof data.note !== 'string') {
    console.error('Validation Failed');
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: "Couldn't add the note.",
    };
  }

  try {
    await sns.send(
      new PublishCommand({
        Message: data.note,
        TopicArn: process.env.SNS_TOPIC_ARN,
      })
    );
  } catch (error) {
    console.error(error);
    return {
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: "Couldn't add the note due an internal error. Please try again later.",
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Successfully added the note.' }),
  };
};
