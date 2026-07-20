export function isAValidPullRequest(body) {
  return body.pull_request.body.startsWith('Related trello card: https://trello.com');
}

export function eventIsAPullRequest(body) {
  return body && ('pull_request' in body);
}

export async function updatePullRequestStatus(payload, repository, pullRequest) {
  const response = await fetch(
    `https://api.github.com/repos/${repository.full_name}/statuses/${pullRequest.head.sha}`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }
}
