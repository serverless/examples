<!--
title: 'AWS MCP Server with a Custom Lambda Authorizer and Auth0 (NodeJS)'
description: 'Reject unauthorized MCP traffic at API Gateway before the Lambda runs, using your own Lambda authorizer with Auth0 as the identity provider, with the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server with a Custom Lambda Authorizer

The bring-your-own-verification member of the [MCP examples](../README.md). The [Framework never verifies tokens](https://www.serverless.com/framework/docs/providers/aws/guide/mcp#authentication) — enforcement is yours — and when your identity provider is not Amazon Cognito (here it is **Auth0**), or the accept/reject decision needs logic of your own, the enforcement shape is a **Lambda authorizer**: one of your own functions, named on the server, wired by the Framework to the MCP route so API Gateway consults it before the server function is invoked. What it rejects, the server never runs for.

```yaml
functions:
  mcpAuthorizer:
    handler: src/authorizer.handler

mcp:
  servers:
    demo:
      server: src/server.mjs
      authorizer: mcpAuthorizer
      oauthDiscovery:
        issuer: ${env:MCP_ISSUER}
```

The Framework wires the authorizer to the **MCP route only**. The discovery route deliberately stays open, because a client has to read that document before it has a token — an easy thing to get wrong when wiring this by hand. And `oauthDiscovery` is advertisement, not enforcement: the document tells clients where to log in; the authorizer is what rejects.

## The shape of the event — read this before writing your own

The string form above compiles a **TOKEN authorizer**, and a TOKEN authorizer receives exactly one thing: the `Authorization` header's value, as `event.authorizationToken`. There is no `event.headers`, no method, no path — an authorizer function written against the full request event finds nothing where it looks and rejects every call. `src/authorizer.mjs` is written against the TOKEN shape, and it is the right default: the event is minimal, and API Gateway rejects requests that omit the header without invoking the authorizer at all.

When the decision genuinely needs more than the token — another header, the source IP, a query parameter — the object form's `type: request` is the escape hatch, delivering the full request event:

```yaml
mcp:
  servers:
    demo:
      server: src/server.mjs
      authorizer:
        name: mcpAuthorizer
        type: request
        identitySource: method.request.header.Authorization
```

The object form accepts everything an `http` event's `authorizer` object does — `resultTtlInSeconds` to tune the verdict cache (300 seconds by default, per token; with this example's throw-style rejections only `Allow` verdicts ever enter it — the rejection table below covers why), `arn` for a function outside this service, `authorizerId` for an authorizer that already exists — and compiles through the same machinery, so the [API Gateway authorizer documentation](https://www.serverless.com/framework/docs/providers/aws/events/apigateway#http-endpoints-with-custom-authorizers) applies verbatim. The one exception is `claims`, which only does anything under API Gateway's `lambda` integration — an integration MCP routes never compile; leave it out.

## What rejection looks like

Every path out of the authorizer is API Gateway's own response — a bare `401 {"message":"Unauthorized"}` — never the MCP specification's challenge:

| Request                            | Rejected by                                 | Cost                                                                                                           |
| ---------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| No `Authorization` header          | API Gateway, on the missing identity source | No invocation at all                                                                                           |
| A garbage or expired token         | The authorizer's JWKS check                 | One authorizer invocation — per request; rejections are never cached                                           |
| A valid token for another audience | The authorizer's audience rule              | One authorizer invocation — per request; rejections are never cached                                           |
| A valid token                      | Nobody — the server runs                    | The server invocation you wanted; the `Allow` verdict is cached, so repeats inside the TTL skip the authorizer |

The asymmetry in that table is deliberate. API Gateway caches only policy documents, and this authorizer rejects by throwing — a thrown rejection returns no policy, so nothing enters the cache and every rejected request re-invokes the function: three requests with the same bad token are three authorizer invocations, where three with the same valid token are one. Returning an explicit `Deny` policy instead would make rejections cache too — but API Gateway answers a `Deny` with `403` (its `ACCESS_DENIED` response), and it is the `401` that carries clients into the OAuth flow, so this example keeps the throw. Either way, what a rejection never costs is the server invocation — the function you actually pay to run. One operational consequence of the throw: each rejection lands in the authorizer's logs as an invocation error with a stack trace and counts toward its `Errors` metric. That is expected, not a malfunction — alarm on the server's errors instead, or log a structured line before throwing if you want a countable rejection signal.

That bare `401` is still enough for the official SDK client, which starts its OAuth flow on any `401` and then probes the well-known discovery paths. Whether those probes then _find_ the document published by `oauthDiscovery` is a separate question, decided by the endpoint's shape: the probes look under the origin root, and on the raw `execute-api` URL this example deploys to the document sits under the stage prefix, where no probe lands — the root-mapped custom domain covered in the [oauth-cognito README](../oauth-cognito/README.md#interactive-clients-need-a-custom-domain) is what fixes that. Machine-to-machine callers like this example's, issued their tokens out of band, never probe at all. What no gateway rejection can carry is the spec's `WWW-Authenticate` challenge and scope-aware `403`s; when you want those semantics, or the caller's verified identity inside your tools, add the in-module gate from [oauth-in-module](../oauth-in-module) behind this authorizer — the two compose, cheap flood rejection in front and the spec's judgement behind it.

## Setup

Any OIDC issuer that mints machine-to-machine tokens works here: the authorizer's audience rule accepts a token's `aud` when present and its `client_id` otherwise, so both audience shapes in the wild pass unchanged. Auth0 is what the steps below use — and if you have no Auth0 tenant, an Amazon Cognito user pool stands in fine: the [oauth-cognito](../oauth-cognito) sibling declares a complete pool in its `resources:` and its README mints the tokens; point `MCP_ISSUER` at that pool's issuer URL and `MCP_AUDIENCE` at its app-client id.

Install the [Auth0 CLI](https://github.com/auth0/auth0-cli) and log in to a tenant you own:

```bash
auth0 login
```

Create an API — its identifier is the audience your tokens will carry, and it does not have to resolve:

```bash
auth0 apis create --name "MCP Demo" --identifier "https://mcp.example.com" \
  --scopes "invoke:tools" --token-lifetime 86400 --no-input
```

(The `invoke:tools` scope is declared but nothing in this example requests or checks it — the authorizer gates on issuer and audience only. Scope enforcement is the natural extension, and [oauth-in-module](../oauth-in-module) shows where it lives.)

Create a machine-to-machine application for a service caller:

```bash
auth0 apps create --name "MCP Demo Client" --type m2m \
  --description "Calls the MCP demo server" --no-input
```

The CLI prints the client id (the secret stays masked unless you pass `--reveal-secrets`, and nothing below needs it). Creating the application does not authorize it for the API — open it in the dashboard (`auth0 apps open <client-id>`) and grant it access to the API you just created, or create the grant from the CLI through its Management API passthrough (`auth0 api post client-grants`).

Point the example at that tenant. **The issuer must be exactly what your tenant's discovery document declares — including the trailing slash Auth0 uses** — because the JWKS check compares it verbatim against the token's `iss` claim:

```bash
export MCP_ISSUER="https://your-tenant.us.auth0.com/"
export MCP_AUDIENCE="https://mcp.example.com"
```

The issuer-agnosticism promised at the top is the audience rule in `src/authorizer.mjs` at work: Auth0 access tokens carry the API identifier in `aud`, Amazon Cognito access tokens carry no `aud` at all and identify their caller in `client_id`, and the rule serves both. For a production deployment against Cognito, prefer [oauth-cognito](../oauth-cognito) — API Gateway validates pool tokens itself, no authorizer function needed; for trying this example's pattern out, the `client_id` fallback means a pool works here unchanged.

## Deployment

```bash
npm install
serverless deploy
```

```
[!] MCP server "demo" advertises OAuth discovery at the stage URL, which interactive clients cannot discover. …
mcp: demo → https://abc123def.execute-api.us-east-1.amazonaws.com/dev/demo/mcp
```

The warning is expected on this example's default endpoint: the machine-to-machine callers it centers on never probe for the discovery document, and the [rejection section](#what-rejection-looks-like) covers the endpoint shape. When interactive clients enter the picture, a root-mapped custom domain resolves it — declare it under `provider.domain`, or point `mcp.servers.demo.oauthDiscovery.publicUrl` at a domain managed outside this service.

## Testing

Mint a token for the machine client. The Auth0 CLI does it without you handling the secret:

```bash
auth0 test token <client-id> --audience "https://mcp.example.com" --force
```

Set `ENDPOINT` to the deployed URL and `TOKEN` to that access token.

**A request with no token — rejected on the missing identity source, before any invocation:**

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -X POST "$ENDPOINT" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-method: tools/list' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{}}}}'
```

```
401
```

**A garbage token — rejected by the authorizer's verification.** The proof that the server never ran is the absence of a log line: the rejection appears in `serverless logs -f mcpAuthorizer`, and `serverless logs -f demo` has nothing for either request (before any authorized call it errors with `No existing streams for the function` — the deploy created the server's log group, but nothing has invoked the function to write a stream into it):

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -X POST "$ENDPOINT" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-method: tools/list' \
  -H 'authorization: Bearer not-a-token' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{}}}}'
```

```
401
```

**The discovery document answers without a token**, because the authorizer is not on that route:

```bash
curl -sS "https://abc123def.execute-api.us-east-1.amazonaws.com/dev/.well-known/oauth-protected-resource/demo/mcp"
```

```json
{
  "resource": "https://abc123def.execute-api.us-east-1.amazonaws.com/dev/demo/mcp",
  "authorization_servers": ["https://your-tenant.us.auth0.com/"],
  "bearer_methods_supported": ["header"]
}
```

**A valid token passes the authorizer and reaches the server:**

```bash
curl -sS -X POST "$ENDPOINT" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-method: tools/call' -H 'mcp-name: add' \
  -H "authorization: Bearer $TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"add","arguments":{"a":2,"b":40},"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}'
```

```json
{
  "result": {
    "content": [{ "type": "text", "text": "42" }],
    "structuredContent": { "sum": 42 },
    "resultType": "complete"
  },
  "jsonrpc": "2.0",
  "id": 1
}
```

(Trimmed — the live response also carries a `_meta` block naming the server.)

The [hub README](../README.md) has the official-client script (pass the token as `BEARER`) and the capability matrix that applies to every example in the family.

## Claude Code: URL-only (Dynamic Client Registration)

There are two ways an interactive client ends up with a client id for your issuer:

- **Pre-registration** — you create the app client and hand its id to the client. This works against every issuer, including those without registration support; the [oauth-cognito README](../oauth-cognito/README.md#interactive-clients-need-a-custom-domain) walks that path (`claude mcp add … --client-id <id> --callback-port <port>`).
- **Dynamic Client Registration (DCR)** — the client registers _itself_ with the issuer, and needs nothing but the URL. The URL is the server's real address — the root-mapped custom domain this path requires (covered below), not the Setup section's API identifier, which never resolves:

  ```bash
  claude mcp add --transport http demo https://mcp.your-domain.com/demo/mcp
  ```

  On the first authenticate, the client reads the document `oauthDiscovery` publishes, finds the `registration_endpoint` in the issuer's metadata, registers, and runs the same authorization-code + PKCE login a pre-registered client runs — choosing its own local callback port along the way, so not even `--callback-port` is needed.

Nothing on the server side is different between the two: registration is a client-to-issuer affair, and this example's authorizer verifies the resulting token exactly as it verifies any other — issuer, signature, expiry, audience. The audience is the leg to align deliberately, because a URL-only client identifies the server by URL alone: it sends the MCP endpoint's URL as `resource` (RFC 8707) on its authorization and token requests, never an Auth0-style `audience` parameter. Meeting it needs two things: the API registered at the issuer under **the MCP endpoint's URL as its identifier** (not the bare origin used in the M2M setup above — following this path means changing that identifier and `MCP_AUDIENCE` to match), and the issuer actually honoring the `resource` parameter — on Auth0 that is the tenant's **Resource Parameter Compatibility Profile**, disabled by default. And as with every interactive flow in this family, the discovery leg needs a root-mapped custom domain — the [rejection section](#what-rejection-looks-like) covers why.

Beyond that, what the URL-only path requires is on the issuer's side. For Auth0, at least: dynamic client registration enabled on the tenant, a connection available to dynamically-registered clients (they register as **third-party** applications, which can only use domain-level connections), and the **New Universal Login** experience — Auth0 does not serve third-party clients from the Classic one. Legacy Rules are their own hurdle: a strict-mode third-party client is refused outright when any Rule is enabled, with an error that surfaces only after the login itself — migrating Rules to Actions clears it, or the tenant's registration security mode can place registered clients in permissive mode, where Rules still run. Expect a consent screen — third-party applications always ask. Two of these switches change the whole tenant's posture, so treat them deliberately: while registration is enabled, the registration endpoint is unauthenticated by design (anyone who knows the tenant domain can register a client), and a domain-level connection is available to every third-party application, not just this one — prefer a dedicated connection you can delete afterwards over promoting a shared one.

One diagnostic to know: when this path fails, clients tend to say very little — Claude Code reports a bare `SDK auth failed:` with no detail at all. The issuer's real answer is one request away. With registration disabled, for example:

```bash
curl -s -X POST https://your-tenant.us.auth0.com/oidc/register \
  -H 'content-type: application/json' \
  -d '{"client_name":"probe","redirect_uris":["http://localhost:8976/callback"]}'
```

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "dynamic client registration is disabled"
}
```

The issuer's metadata advertises a `registration_endpoint` whether or not registration is actually enabled, so the probe — not the metadata — is what tells you.

## Clean up

```bash
serverless remove
auth0 apis delete "https://mcp.example.com" --force
auth0 apps delete <client-id> --force
```

If you enabled the URL-only path, also revert the tenant switches: disable dynamic client registration, demote (or delete) the connection you made domain-level, and delete any clients that registered themselves while it was on — they are ordinary applications in the dashboard, named by the client that created them. And if you re-registered the API under the MCP endpoint's URL, delete it by that identifier rather than the one above.
