import { client } from 'octonode'
import { success, failure, githubSuccessPayload, githubFailurePayload } from './libs/response-lib'
import {
  isAValidPullRequest, eventIsAPullRequest, updatePullRequestStatus, checkWebhookSecret
} from './libs/github-service'

export async function githubCheck(event, context, callback) {
  const githubClient = client(process.env.GITHUB_TOKEN)
  checkWebhookSecret(process.env.GITHUB_WEBHOOK_SECRET)

  let body = JSON.parse(event.body)
  if (!eventIsAPullRequest(body)) return callback(null, success('Event is not a Pull Request'))
  const payload = isAValidPullRequest(body) ? githubSuccessPayload() : githubFailurePayload()
  try {
    await updatePullRequestStatus(githubClient, payload, body.repository, body.pull_request)
    callback(null, success(`Process finished with state: ${payload.state}`))
  } catch (e) {
    callback(null, failure(`Process finished with error`))
  }
}
