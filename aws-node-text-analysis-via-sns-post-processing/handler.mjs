import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient();

// POST /notes with {"note": "..."}: publishes the note to the topic and answers
// right away. The analysis happens later, in analyzeNote.
export const addNote = async (event) => {
  let note;
  try {
    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    note = JSON.parse(body ?? '').note;
  } catch {
    // Not JSON: answered below.
  }
  if (typeof note !== 'string' || note.trim() === '') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Send a JSON body with a "note" string.' }) };
  }

  const { MessageId } = await sns.send(new PublishCommand({ TopicArn: process.env.TOPIC_ARN, Message: note }));
  console.log(`Published note ${MessageId}`);
  return { statusCode: 202, body: JSON.stringify({ messageId: MessageId }) };
};

// Invoked by SNS for every message published to the topic.
export const analyzeNote = async (event) => {
  for (const record of event.Records) {
    const { MessageId, Message } = record.Sns;
    const words = Message.split(/\s+/).filter(Boolean).length;
    const sentences = Message.split(/[.!?]+/).filter((s) => s.trim() !== '').length;
    console.log(`Analyzed note ${MessageId}: ${words} words, ${sentences} sentences, ${Message.length} characters`);
  }
};
