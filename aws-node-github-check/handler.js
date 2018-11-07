import { client } from 'octonode'; // eslint-disable-line import/extensions
import { success, failure, githubSuccessPayload, githubFailurePayload } from './libs/response-lib';
import { isAValidPullRequest, eventIsAPullRequest, updatePullRequestStatus } from './libs/github-service';

/* eslint-disable import/prefer-default-export */
export async function githubCheck(event, context, callback) {
  const githubClient = client(process.env.GITHUB_TOKEN);

  const body = JSON.parse(event.body);
  if (!eventIsAPullRequest(body)) return callback(null, success('Event is not a Pull Request'));
  const payload = isAValidPullRequest(body) ? githubSuccessPayload() : githubFailurePayload();
  try {
    await updatePullRequestStatus(githubClient, payload, body.repository, body.pull_request);
    return callback(null, success(`Process finished with state: ${payload.state}`));
  } catch (e) {
    return callback(null, failure('Process finished with error'));
  }
}
