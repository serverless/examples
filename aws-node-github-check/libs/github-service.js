export function isAValidPullRequest(body) {
  if (!body.pull_request.body.startsWith('Related trello card: https://trello.com')) return false
  return true
}

export function eventIsAPullRequest(body) {
  if (!body || !body.hasOwnProperty('pull_request')) return false
  return true
}

export function updatePullRequestStatus(githubClient, payload, repository, pullRequest) {
  return new Promise((resolve, reject) => {
    githubClient.post(`/repos/${repository.full_name}/statuses/${pullRequest.head.sha}`, payload, {}, (err, _body) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function checkWebhookSecret(secret) {
  if (typeof secret !== 'string') {
    return callback(null, failure('Must provide a \'GITHUB_WEBHOOK_SECRET\' env variable'))
  }
}
