/**
 * A Lambda authorizer for the MCP route: API Gateway calls this before the
 * server function, so a request without a valid token never reaches it — and
 * never bills it. The Framework wires it up from `authorizer: mcpAuthorizer`
 * in serverless.yml; the Framework itself verifies nothing, so what this
 * function accepts IS the server's access control.
 *
 * Verification is a standard JWKS check, so `jose` is a dependency of this
 * example. The remote key set is created once per execution environment and
 * caches keys across invocations, and API Gateway caches the Allow policy this
 * function returns, per token, for the TTL configured on the authorizer (300
 * seconds by default). Rejections throw instead of returning a policy, so they
 * are never cached — every rejected request re-invokes this function.
 */
import { createRemoteJWKSet, jwtVerify } from 'jose'

const ISSUER = process.env.MCP_ISSUER
const AUDIENCE = process.env.MCP_AUDIENCE

// Module scope on purpose: one key set per execution environment, reused by
// every invocation it serves.
const jwks = createRemoteJWKSet(
  new URL('.well-known/jwks.json', ISSUER.endsWith('/') ? ISSUER : `${ISSUER}/`),
)

export const handler = async (event) => {
  // Naming an authorizer as a bare string gives you a TOKEN authorizer, and a
  // TOKEN authorizer receives ONLY the Authorization header's value, as
  // `event.authorizationToken` — there is no `event.headers`, so an authorizer
  // written against the full request event finds nothing where it looks and
  // rejects every call. (The object form with `type: request` is the one that
  // gets headers; it costs a wider event and is only needed when the decision
  // depends on more than the token.)
  const header = event.authorizationToken
  const token = header?.replace(/^Bearer /i, '')

  // "Unauthorized" (the literal string) is what API Gateway turns into a 401.
  // Anything else it reports as a 500, so a verification failure has to look
  // like this rather than like an error.
  if (!token || token === header) throw new Error('Unauthorized')

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: ISSUER,
      requiredClaims: ['exp'],
    })

    // The audience, checked by hand rather than passed to jwtVerify: an Auth0
    // access token carries the API identifier in `aud`, while a Cognito access
    // token has no `aud` at all and identifies its caller in `client_id` — so
    // the rule is "match `aud` when present, `client_id` otherwise", and one
    // authorizer serves both issuer families.
    const presented = payload.aud ?? payload.client_id
    const values = Array.isArray(presented) ? presented : [presented]
    if (!values.includes(AUDIENCE)) throw new Error('audience mismatch')

    return {
      // The gateway caches by token, so the principal must be derived from the
      // token rather than fixed — a shared principal would blur its cache
      // entries together.
      principalId: payload.sub ?? 'unknown',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            // The whole stage, not `event.methodArn`: the gateway caches this
            // document per token, and a per-request resource would authorize
            // only the first request the cache was filled from.
            Resource: `${event.methodArn.split('/').slice(0, 2).join('/')}/*`,
          },
        ],
      },
      // Context is delivered into the server function's EVENT, but the MCP
      // entry hands your module only the HTTP request itself — identity your
      // tools consume has to come from an in-module gate instead (see the
      // oauth-in-module example). Populated here anyway: it lands in API
      // Gateway's access logs, where it is genuinely useful. Values must be
      // strings, numbers or booleans — API Gateway drops objects.
      context: { sub: String(payload.sub ?? ''), scope: String(payload.scope ?? '') },
    }
  } catch {
    // Deliberately opaque: the reason a token failed is for your logs, not for
    // the caller.
    throw new Error('Unauthorized')
  }
}
