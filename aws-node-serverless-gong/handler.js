const crypto = require('crypto');
const Slack = require('slack-node');

// validate your payload from GitHub
function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}
// webhook handler function
exports.gongHandler = async (event) => {
  // get the GitHub secret from the environment variables
  const token = process.env.GITHUB_WEBHOOK_SECRET;
  const calculatedSig = signRequestBody(token, event.body);
  let errMsg;
  // get the remaining variables from the GitHub event
  const headers = event.headers;
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const body = JSON.parse(event.body);
  // get repo variables
  const { repository, release } = body;
  const repo = repository.full_name;
  const url = repository.url;
  // set variables for a release event
  let releaseVersion, releaseUrl, author = null;

  if (githubEvent === 'release') {
    releaseVersion = release.tag_name;
    releaseUrl = release.html_url;
    author = release.author.login;
  }
  
  // check that a GitHub webhook secret variable exists, if not, return an error
  if (typeof token !== 'string') {
    errMsg = 'Must provide a \'GITHUB_WEBHOOK_SECRET\' env variable';
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    };
  }
  // check validity of GitHub token
  if (sig !== calculatedSig) {
    errMsg = 'X-Hub-Signature incorrect. Github webhook token doesn\'t match';
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    };
  }

  // if the event is a 'release' event, gong the Slack channel!
  const webhookUri = process.env.SLACK_WEBHOOK_URL;

  const slack = new Slack();
  slack.setWebhook(webhookUri);

  // send slack message
  if (githubEvent === 'release') {
    slack.webhook({
      channel: '#gong-test', // your desired channel here
      username: 'gongbot',  // be creative!
      icon_emoji: ':gong:', // because Slack is for emojis
      // customize your message below
      text: `It's time to celebrate! ${author} pushed release version ${releaseVersion}. See it here: ${releaseUrl}!\n:gong:  https://youtu.be/8nBOF5sJrSE?t=11`,
    }, function (err, response) {
      console.log(response);
      if (err) {
        console.log('Something went wrong');
        console.log(err);
      }
    });
  }

  // (optional) print some messages to the CloudWatch console (for testing)
  console.log('---------------------------------');
  console.log(`\nGithub-Event: "${githubEvent}" on this repo: "${repo}" at the url: ${url}.`);
  console.log(event.body);
  console.log('---------------------------------');

  // return a 200 response if the GitHub tokens match
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
    }),
  };

  return response;
};
