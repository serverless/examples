/**
 * An MCP server that verifies bearer tokens itself, with the SDK's own
 * `requireBearerAuth` gate wrapped around the handler. The default export is
 * no longer bare `createMcpHandler()` output — it is a small object whose
 * `fetch` runs the gate first — but it still satisfies the module contract
 * (an object exposing a web-standard `fetch`), so nothing about deployment
 * changes.
 *
 * The gate owns the spec's semantics: a rejected request gets a `401` with a
 * `WWW-Authenticate` challenge (or a `403 insufficient_scope` when a required
 * scope is missing), and an accepted one hands the verified identity to every
 * tool as `ctx.http.authInfo`. Verification itself is yours — here, a JWKS
 * check with `jose` against the issuer in `MCP_ISSUER`.
 */
import {
  createMcpHandler,
  McpServer,
  OAuthError,
  OAuthErrorCode,
  requireBearerAuth,
} from '@modelcontextprotocol/server'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { z } from 'zod'

const ISSUER = process.env.MCP_ISSUER
const REQUIRED_SCOPES = (process.env.MCP_REQUIRED_SCOPES ?? '')
  .split(' ')
  .filter(Boolean)

// Module scope on purpose: one remote key set per execution environment,
// fetched from the issuer on first use and cached across invocations.
const jwks = createRemoteJWKSet(
  new URL(
    '.well-known/jwks.json',
    ISSUER.endsWith('/') ? ISSUER : `${ISSUER}/`,
  ),
)

const handler = createMcpHandler(() => {
  const server = new McpServer({ name: 'demo', version: '1.0.0' })

  // An instant tool. zod schemas sit next to the implementation, and returning
  // structuredContent alongside the text lets clients consume a typed result.
  server.registerTool(
    'add',
    {
      description: 'Add two numbers',
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      // .finite() with a message: an overflow to Infinity fails output
      // validation either way, but zod's default text for it ("expected
      // number, received number") is undiagnosable.
      outputSchema: z.object({
        sum: z.number().finite('a + b overflowed the double range'),
      }),
    },
    async ({ a, b }) => {
      const output = { sum: a + b }
      return {
        content: [{ type: 'text', text: String(output.sum) }],
        structuredContent: output,
      }
    },
  )

  // The reason to verify in-module, demonstrated: the identity the gate
  // attached is right there in the tool's context, so tools can act on WHO is
  // calling — neither gateway enforcement shape can hand you this.
  server.registerTool(
    'whoami',
    {
      description: 'Return the verified identity of the caller',
      // Required even for a tool with no inputs: without `inputSchema` the SDK
      // passes the context as the callback's ONLY argument.
      inputSchema: z.object({}),
    },
    async (_args, ctx) => {
      const { clientId, scopes } = ctx.http.authInfo ?? {}
      const output = { clientId, scopes }
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output,
      }
    },
  )

  return server
})

const gate = requireBearerAuth({
  // Your verification, returning the SDK's AuthInfo shape. `expiresAt` must be
  // populated — the gate rejects tokens without one — and `jwtVerify` requiring
  // the `exp` claim is what guarantees it is.
  verifier: {
    async verifyAccessToken(token) {
      // A failed verification must be thrown as the SDK's OAuthError: that is
      // what the gate turns into the spec's 401 invalid_token challenge — any
      // other throw is answered as a 500 server_error instead.
      let payload
      try {
        ;({ payload } = await jwtVerify(token, jwks, {
          issuer: ISSUER,
          requiredClaims: ['exp'],
        }))
      } catch {
        // Deliberately unspecific: the reason a token failed is for your
        // logs, not for the caller. Deliberately total, too: a JWKS fetch
        // failure lands here and is blamed on the token — fine for an
        // example; a production verifier may prefer to let infrastructure
        // failures surface as server errors instead.
        throw new OAuthError(OAuthErrorCode.InvalidToken, 'Token verification failed')
      }
      return {
        token,
        // Auth0 puts the caller's client id in `azp`, Cognito in `client_id`;
        // `sub` is the OIDC-guaranteed fallback.
        clientId: String(payload.client_id ?? payload.azp ?? payload.sub ?? ''),
        scopes: String(payload.scope ?? '').split(' ').filter(Boolean),
        expiresAt: payload.exp,
      }
    },
  },
  // A token that verifies but lacks one of these is a 403 insufficient_scope —
  // the distinction a gateway authorizer's bare 401/403 never draws.
  requiredScopes: REQUIRED_SCOPES,
  // `resourceMetadataUrl` would put a resource_metadata pointer on the
  // challenge. Omitted on purpose: this front door renames the challenge
  // header in transit (see the README), so what reaches the discovery
  // document is the well-known probes, not the header — and the probes only
  // land behind a root-mapped custom domain.
})

export default {
  async fetch(request, options) {
    const auth = await gate(request)
    if (auth instanceof Response) return auth
    // Forward the second argument: it carries the pre-parsed request body.
    return handler.fetch(request, { ...options, authInfo: auth })
  },
}
