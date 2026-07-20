import crypto from 'node:crypto';

function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

function signaturesMatch(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

export const githubWebhookListener = async (event) => {
  const token = process.env.GITHUB_WEBHOOK_SECRET;
  const headers = event.headers;
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const id = headers['X-GitHub-Delivery'];

  if (typeof token !== 'string') {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: "Must provide a 'GITHUB_WEBHOOK_SECRET' env variable",
    };
  }

  if (!sig) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: 'No X-Hub-Signature found on request',
    };
  }

  if (!githubEvent) {
    return {
      statusCode: 422,
      headers: { 'Content-Type': 'text/plain' },
      body: 'No X-Github-Event found on request',
    };
  }

  if (!id) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: 'No X-Github-Delivery found on request',
    };
  }

  const calculatedSig = signRequestBody(token, event.body);
  if (!signaturesMatch(sig, calculatedSig)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: "X-Hub-Signature incorrect. Github webhook token doesn't match",
    };
  }

  const body = JSON.parse(event.body);

  console.log('---------------------------------');
  console.log(`Github-Event: "${githubEvent}" with action: "${body.action}"`);
  console.log('---------------------------------');
  console.log('Payload', body);

  // Do custom stuff here with github event data
  // For more on events see https://developer.github.com/v3/activity/events/types/

  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
    }),
  };
};
