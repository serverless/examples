export function success(body) {
  return buildResponse(204, body)
}

export function failure(body) {
  return buildResponse(500, body)
}

export function githubSuccessPayload() {
  return buildGithubPayload('success', 'PR body according to format')
}

export function githubFailurePayload() {
  return buildGithubPayload('failure', 'PR body should start with the related trello card')
}

function buildGithubPayload(state, description) {
  return {
    state: state,
    description: description,
    context: 'serverless-webhook/pr-body'
  }
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body)
  }
}
