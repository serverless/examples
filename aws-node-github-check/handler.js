import { success, failure, githubSuccessPayload, githubFailurePayload } from './libs/response-lib.js';
import { isAValidPullRequest, eventIsAPullRequest, updatePullRequestStatus } from './libs/github-service.js';

export async function githubCheck(event) {
  const body = JSON.parse(event.body);
  if (!eventIsAPullRequest(body)) return success('Event is not a Pull Request');
  const payload = isAValidPullRequest(body) ? githubSuccessPayload() : githubFailurePayload();
  try {
    await updatePullRequestStatus(payload, body.repository, body.pull_request);
    return success(`Process finished with state: ${payload.state}`);
  } catch (e) {
    return failure('Process finished with error');
  }
}
