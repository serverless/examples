export function isAValidPullRequest(body) {
  return body.pull_request.body.startsWith('Related trello card: https://trello.com');
}

export function eventIsAPullRequest(body) {
  return body && ('pull_request' in body);
}

export function updatePullRequestStatus(githubClient, payload, repository, pullRequest) {
  return new Promise((resolve, reject) => {
    githubClient.post(`/repos/${repository.full_name}/statuses/${pullRequest.head.sha}`, payload, {}, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
