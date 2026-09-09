<!--
title: 'AWS MCP Server Verifying OAuth In-Module (NodeJS)'
description: 'Verify OAuth 2.1 bearer tokens inside your MCP server module with the MCP SDK''s requireBearerAuth gate - spec-shaped 401 challenges, scope-aware 403s, and the caller''s identity in your tools, with the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server Verifying OAuth In-Module

The in-module member of the [MCP examples](../README.md). The [Framework never verifies tokens](https://www.serverless.com/framework/docs/providers/aws/guide/mcp#authentication); the gateway-enforced siblings ([oauth-cognito](../oauth-cognito), [oauth-authorizer](../oauth-authorizer)) reject before the function runs, and what they cannot give you is the MCP specification's own semantics — those live where the server lives. This example puts enforcement **inside the module**, using the MCP SDK's own `requireBearerAuth`:

- a rejected request gets the spec's `401` with a `WWW-Authenticate` challenge — not API Gateway's bare `{"message":"Unauthorized"}`
- a token that verifies but lacks a required scope gets `403 insufficient_scope` — a distinction no gateway shape draws
- the verified identity reaches every tool as `ctx.http.authInfo`, and the `whoami` tool here returns it, so you can see the mechanism end to end

The shape of the module is the whole trick: build the handler as usual, build the gate, and default-export a `fetch` that runs the gate first. That still satisfies the module contract — an object exposing a web-standard `fetch` — so nothing about deployment changes:

```js
const gate = requireBearerAuth({
  verifier: {
    async verifyAccessToken(token) {
      /* your JWKS check */
    },
  },
  requiredScopes: REQUIRED_SCOPES,
});

export default {
  async fetch(request, options) {
    const auth = await gate(request);
    if (auth instanceof Response) return auth;
    return handler.fetch(request, { ...options, authInfo: auth });
  },
};
```

Verification itself is yours. Here it is a JWKS check with [`jose`](https://github.com/panva/jose) against the issuer in `MCP_ISSUER` — swap in token introspection or your library of choice; whatever verifies, return the SDK's `AuthInfo` shape with `expiresAt` populated (the gate rejects tokens without one).

In `serverless.yml`, the server carries **no `authorizer`** — every request reaches the function, where the module judges it — and `oauthDiscovery` publishes the discovery document that tells clients where to log in:

```yaml
mcp:
  servers:
    demo:
      server: src/server.mjs
      oauthDiscovery:
        issuer: ${env:MCP_ISSUER}
      environment:
        MCP_ISSUER: ${env:MCP_ISSUER}
        MCP_REQUIRED_SCOPES: ${env:MCP_REQUIRED_SCOPES, ''}
```

The trade-off against a gateway authorizer is cost: every rejection here runs the full server function, where a gateway rejection stops at the authorizer — or costs no invocation at all with a Cognito pool. The strongest setup composes both: a gateway authorizer checking that a token is present and plausibly valid — cheap rejection of floods — and this gate for the judgement that needs the spec's semantics. Either sibling example's authorizer drops into this service unchanged.

## One platform caveat: the challenge header arrives renamed

API Gateway REST renames the `WWW-Authenticate` header in transit, so clients receive the challenge as `x-amzn-remapped-www-authenticate` — AWS-documented, not configurable. A client that reads only `WWW-Authenticate` learns nothing from it. What carries clients into the login flow anyway is the **bare `401` itself**: the official SDK client starts its OAuth flow on any `401` and then probes the well-known discovery paths (path-aware, with a root fallback), and clients that probe by convention — Claude Code is one — go straight to the well-known paths and never read response headers at all. Neither class depends on the renamed header, so the rename itself costs them nothing — but whether their probes then find the document `oauthDiscovery` publishes is decided by the endpoint's shape: the well-known probes look under the origin root, which the raw `execute-api` URL this README tests against cannot satisfy; the [oauth-cognito README](../oauth-cognito/README.md#interactive-clients-need-a-custom-domain) covers the root-mapped custom domain that fixes it. Machine-to-machine callers, which already hold their tokens, never probe at all.

## Setup

Any OIDC issuer whose tokens carry `exp` and (for the scope check) `scope` works. The quickest self-contained path: deploy the [oauth-cognito](../oauth-cognito) sibling first and borrow its pool as the issuer — its stack outputs carry everything, and its README's token walkthrough mints the tokens you'll test with:

```bash
STACK=mcp-oauth-cognito-dev
export MCP_ISSUER=$(aws cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='Issuer'].OutputValue" --output text)
export MCP_REQUIRED_SCOPES="mcp/invoke"
```

## Deployment

```bash
npm install
serverless deploy
```

```
mcp: demo → https://xyz789ghi.execute-api.us-east-1.amazonaws.com/dev/demo/mcp
```

The deploy also prints a warning that the discovery document lives at the stage URL, where interactive clients cannot discover it. That is expected on this example's default endpoint — the [platform caveat](#one-platform-caveat-the-challenge-header-arrives-renamed) above covers the endpoint-shape question, and the machine-to-machine callers this README tests with never read the document at all. When a custom domain does front the service, declare it under `provider.domain`, or point `mcp.servers.demo.oauthDiscovery.publicUrl` at a domain managed outside this service — either aims the advertisement at it.

Set `ENDPOINT` to that URL for everything below.

## Testing

### The rejections carry the spec's shape

No token — a `401` whose challenge (under the remapped name) names the error:

```bash
curl -sS -o /dev/null -D- -X POST "$ENDPOINT" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-method: tools/list' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{}}}}' \
  | grep -i 'http/\|www-authenticate'
```

```
HTTP/2 401
x-amzn-remapped-www-authenticate: Bearer error="invalid_token", error_description="Missing Authorization header", scope="mcp/invoke"
```

A garbage token is judged by your verifier and rejected the same way, `error="invalid_token", error_description="Token verification failed"`. And unlike the gateway-enforced siblings, each rejection shows up in `serverless logs -f demo` as an invocation record — `START`/`END`/`REPORT` lines with a billed duration, not a log line naming the rejection. The function ran; that is the cost side of the trade-off, visible.

The discovery document reads without a token, as always:

```bash
curl -sS "https://xyz789ghi.execute-api.us-east-1.amazonaws.com/dev/.well-known/oauth-protected-resource/demo/mcp"
```

```json
{
  "resource": "https://xyz789ghi.execute-api.us-east-1.amazonaws.com/dev/demo/mcp",
  "authorization_servers": [
    "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX"
  ],
  "bearer_methods_supported": ["header"]
}
```

### A valid token reaches the tools — identity attached

Mint `TOKEN` per the [oauth-cognito README](../oauth-cognito/README.md#mint-a-token-and-call-a-tool) (or from your own issuer), then ask the server who is calling:

```bash
curl -sS -X POST "$ENDPOINT" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-method: tools/call' -H 'mcp-name: whoami' \
  -H "authorization: Bearer $TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"whoami","arguments":{},"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}'
```

```json
{
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"clientId\":\"abc123def456ghi789jkl0\",\"scopes\":[\"mcp/invoke\"]}"
      }
    ],
    "structuredContent": {
      "clientId": "abc123def456ghi789jkl0",
      "scopes": ["mcp/invoke"]
    },
    "resultType": "complete"
  },
  "jsonrpc": "2.0",
  "id": 1
}
```

(Trimmed — the live response also carries a `_meta` block naming the server.)

That `clientId` is the caller's — verified by your code, attached by the gate, consumed by the tool. To see the scope path reject, require a scope your tokens do not carry (`MCP_REQUIRED_SCOPES="mcp/admin" serverless deploy`) and repeat the call: the same valid token now gets `403` with `error="insufficient_scope", error_description="Insufficient scope", scope="mcp/admin"` on the remapped challenge header. The service keeps requiring `mcp/admin` — and rejecting your tokens — until you restore it, so redeploy with a plain `serverless deploy` (the `mcp/invoke` export from Setup still stands) before moving on.

The [hub README](../README.md) has the official-client script (pass the token as `BEARER`) and the capability matrix that applies to every example in the family.

## Claude Code

The same token puts **Claude Code** on this endpoint — no custom domain, no login flow, because the header carries what the login flow would have obtained. The `--` is required after `--header`, which takes multiple values and would otherwise swallow the name and URL that follow it; commands without `--header` need no separator:

```bash
claude mcp add --transport http --header "Authorization: Bearer $TOKEN" -- demo "$ENDPOINT"
claude mcp list
```

```
demo: https://xyz789ghi.execute-api.us-east-1.amazonaws.com/dev/demo/mcp (HTTP) - ✔ Connected
```

A headless call closes the loop — the phrasing of the reply is the model's, but the identity it returns is the one your verifier attached, retrieved by a real MCP client:

```bash
claude -p "call the whoami tool from the demo MCP server and show the raw result" --allowedTools "mcp__demo__whoami"
```

```
{"clientId":"abc123def456ghi789jkl0","scopes":["mcp/invoke"]}
```

A pasted header never refreshes, so calls start answering the gate's `401` when the token expires — re-add with a fresh one. `claude mcp remove demo` deregisters it. The browser-login alternative is the [oauth-cognito walkthrough](../oauth-cognito/README.md#interactive-clients-need-a-custom-domain), and it applies here the same way once a root-mapped domain fronts the service.

## Develop it live

`serverless dev` serves this example too — and since enforcement lives in the module here, the verification code is precisely what runs on your machine: edit it, and the next request is judged by the new logic, no redeploy. The [minimal example's walkthrough](../minimal/README.md#develop-it-live) and the [Dev Mode docs](https://www.serverless.com/framework/docs/providers/aws/guide/mcp#dev-mode) apply unchanged.

## Clean up

```bash
serverless remove
```

If you stood up the [oauth-cognito](../oauth-cognito) sibling just to serve as this example's issuer, it needs its own `serverless remove`, run there.
