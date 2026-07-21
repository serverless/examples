import crypto from 'node:crypto';

// validate your payload from GitHub
function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

function signaturesMatch(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

// webhook handler function
export const gongHandler = async (event) => {
  // get the GitHub secret from the environment variables
  const token = process.env.GITHUB_WEBHOOK_SECRET;

  // check that a GitHub webhook secret variable exists, if not, return an error
  if (typeof token !== 'string') {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: "Must provide a 'GITHUB_WEBHOOK_SECRET' env variable",
    };
  }

  // get the remaining variables from the GitHub event
  const headers = event.headers;
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const calculatedSig = signRequestBody(token, event.body);

  // check validity of GitHub token
  if (!sig || !signaturesMatch(sig, calculatedSig)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: "X-Hub-Signature incorrect. Github webhook token doesn't match",
    };
  }

  const body = JSON.parse(event.body);
  // get repo variables
  const { repository, release } = body;
  const repo = repository.full_name;
  const url = repository.url;

  // if the event is a 'release' event, gong the Slack channel!
  if (githubEvent === 'release') {
    const releaseVersion = release.tag_name;
    const releaseUrl = release.html_url;
    const author = release.author.login;

    try {
      const slackResponse = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: '#gong-test', // your desired channel here
          username: 'gongbot', // be creative!
          icon_emoji: ':gong:', // because Slack is for emojis
          // customize your message below
          text: `It's time to celebrate! ${author} pushed release version ${releaseVersion}. See it here: ${releaseUrl}!\n:gong:  https://youtu.be/8nBOF5sJrSE?t=11`,
        }),
      });
      console.log(await slackResponse.text());
    } catch (err) {
      console.log('Something went wrong');
      console.log(err);
    }
  }

  // (optional) print some messages to the CloudWatch console (for testing)
  console.log('---------------------------------');
  console.log(`\nGithub-Event: "${githubEvent}" on this repo: "${repo}" at the url: ${url}.`);
  console.log(event.body);
  console.log('---------------------------------');

  // return a 200 response if the GitHub tokens match
  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
    }),
  };
};
