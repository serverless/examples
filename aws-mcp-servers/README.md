# MCP Servers on AWS

Examples for hosting a [Model Context Protocol](https://modelcontextprotocol.io) server on AWS with the Serverless Framework.

The MCP `2026-07-28` protocol revision made servers **stateless**: every request is self-contained - no initialize handshake, no sessions, no sticky routing - so any request can be served by any Lambda execution environment or container instance. That makes serverless hosting a natural fit, and these examples show every way to do it.

**They all serve the same canonical MCP server** (built with the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) v2) and differ only in the hosting glue, so you can compare approaches directly and test every one with the same client script (`client.mjs`, shipped in each example). The canonical server exercises the full protocol surface:

- **Tools** - `add` (plain JSON + structured output), `slow_report` (progress notifications streamed over SSE), `approve_refund` (elicitation: the tool pauses mid-call to ask the user for confirmation and resumes on retry)
- **Resources** - a static document plus an `orders://{orderId}` template
- **Prompts** - a fill-in prompt template
- **`server/discover`** - server `instructions` for client discovery
- **Cache hints** - `ttlMs`/`cacheScope` on list results, configured rather than the conservative defaults
- **Legacy fallback** - older clients sending `initialize` are answered on the same endpoint
- Plus commented extensions in each example: authentication (three flavors, see below) and HMAC-sealed round-trip state

## The examples

| Example | Hosting | Lambda glue | What it uniquely shows |
| --- | --- | --- | --- |
| [rest-api](rest-api) | API Gateway REST, `transferMode: stream` | ~80-line adapter (`src/lambda.mjs`) | The full-featured front door: custom domains, WAF, throttling, usage plans, gateway authorizers |
| [function-url](function-url) | Lambda Function URL, `invokeMode: RESPONSE_STREAM` | ~80-line adapter (Function URL event shape) | The leanest hosting: no API Gateway, no per-request fee, streams bounded only by function timeout |
| [hono](hono) | Lambda Function URL | **none** - official `@modelcontextprotocol/hono` + Hono's `streamHandle` | Zero custom glue: existing maintained packages do all the bridging |
| [express-web-adapter](express-web-adapter) | API Gateway REST stream + Lambda Web Adapter (**zip**) | **none** - the app is a plain Express server | Official `@modelcontextprotocol/express`; app code runs unchanged anywhere |
| [fastify-container](fastify-container) | Function URL + Lambda Web Adapter (**container image**) | **none** - the app is a plain Fastify server | Official `@modelcontextprotocol/fastify`; a portable image that also runs on Fargate/App Runner |
| [agentcore-runtime](agentcore-runtime) | AWS Bedrock AgentCore Runtime (managed container) | none - plain HTTP container | Managed MCP hosting: session isolation, config-only platform OAuth |
| [agentcore-gateway](agentcore-gateway) | AWS Bedrock AgentCore Gateway | none - **and no MCP SDK either** | AWS runs the MCP server; your code is plain Lambda functions with the schema in `serverless.yml` |

## Three independent choices

The Lambda-based examples vary along three axes that are **fully independent** - each example pins one combination to stay minimal, not because the pieces require each other:

1. **Web framework / bridge** - hand-written adapter, Hono, Express, or Fastify. Any of them works with any packaging and any front door.
2. **Packaging** - zip (no Docker needed) or container image (portable beyond Lambda). Express runs fine in a container; Fastify runs fine in a zip.
3. **Front door** - API Gateway REST in stream mode, or a Lambda Function URL. Both carry plain JSON and SSE on the same endpoint; both were exercised with every bridge.

## Choosing a front door

| | API Gateway REST (stream) | Lambda Function URL |
| --- | --- | --- |
| Custom domain, WAF, throttling, usage plans | yes | domain via CloudFront in front |
| Reject unauthenticated requests before invoking | yes (authorizer) | IAM/SigV4 only |
| Streaming (SSE) | yes - raise `timeoutInMillis` alongside (up to 15 min) | yes - function `timeout` is the only bound |
| Per-request cost | per-request fee (see [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/)), no streaming surcharge | none (Lambda streaming meters egress beyond the first 6 MB per response - see [Lambda pricing](https://aws.amazon.com/lambda/pricing/)) |

AgentCore Runtime replaces the front-door question entirely (the platform hosts the endpoint, IAM or JWT auth, consumption-based pricing - see [AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/)); AgentCore Gateway additionally replaces the MCP server itself.

## Capabilities and limitations

| | Lambda examples (any bridge) | AgentCore Runtime | AgentCore Gateway |
| --- | --- | --- | --- |
| Streamed progress (SSE) | yes | yes | not from Lambda-backed tools |
| Elicitation (tool asks the user) | yes | yes | not from Lambda-backed tools |
| Exact tool names | yes | yes | prefixed `target___tool` |
| Cache hints (`ttlMs`/`cacheScope`) | yes (configurable) | yes (configurable) | fixed by the platform |
| Max tool duration | 15 min (function timeout) | platform limits | synchronous Lambda invoke |
| Your code contains MCP | the server (official SDK) | the server (official SDK) | nothing - plain functions |
| Semantic tool search | - | - | yes (built-in search tool) |

## Authentication

Every example includes the same three options (commented, with complete code):

1. **Platform auth** - reject requests before they reach your code: an API Gateway JWT authorizer (`src/authorizer.mjs` in the REST-fronted examples - works with any OpenID Connect provider), `authorizer: aws_iam` on Function URLs, or AgentCore's config-only `authorizer.jwt`.
2. **In-process** - the SDK's `requireBearerAuth` with a `jose` JWKS verifier; identical behind every front door.
3. **OAuth discovery** - a `/.well-known/oauth-protected-resource` route so MCP clients can find your authorization server.

## Testing

Each example ships the identical `client.mjs`:

```bash
ENDPOINT=<endpoint> node client.mjs                                   # 12 protocol checks
LONG=1 ENDPOINT=<endpoint> node client.mjs                            # + a ~36s streaming case
AUTH=sigv4 SERVICE=bedrock-agentcore ENDPOINT=<url> node client.mjs   # AgentCore Runtime (SigV4)
AUTH=sigv4 SERVICE=lambda ENDPOINT=<url> node client.mjs              # IAM-auth Function URL
```

The checks cover the whole surface, including two negative cases proving the `2026-07-28` protocol validation is active end to end: a mismatching `Mcp-Method` header (`-32020`) and an elicitation call from a client that did not declare the capability (`-32021`).
