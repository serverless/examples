/**
 * A Lambda TOKEN authorizer validating OAuth Bearer JWTs against any OpenID
 * Connect provider - API Gateway rejects unauthenticated requests before they
 * ever invoke (and bill) the MCP function.
 *
 * Configure via environment variables on the authorizer function:
 *   JWKS_URL       e.g. https://your-tenant.example.com/.well-known/jwks.json
 *   TOKEN_ISSUER   e.g. https://your-tenant.example.com/
 *   TOKEN_AUDIENCE e.g. https://your-mcp-endpoint
 */
import { createRemoteJWKSet, jwtVerify } from 'jose'

const jwks = createRemoteJWKSet(new URL(process.env.JWKS_URL))

export const handler = async (event) => {
  const token = event.authorizationToken?.replace(/^Bearer /i, '')
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: process.env.TOKEN_ISSUER,
      audience: process.env.TOKEN_AUDIENCE,
    })
    return {
      principalId: payload.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{ Action: 'execute-api:Invoke', Effect: 'Allow', Resource: event.methodArn }],
      },
    }
  } catch {
    // API Gateway maps this exact message to a 401 response.
    throw new Error('Unauthorized')
  }
}
