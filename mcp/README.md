# MCP Servers on AWS

Host a [Model Context Protocol](https://modelcontextprotocol.io) server on AWS with the Serverless Framework. The MCP `2026-07-28` revision made servers **stateless** — every request is self-contained, so any Lambda instance can serve any request — which makes serverless hosting a natural fit.

**Start with the Framework's [built-in MCP server support](https://www.serverless.com/framework/docs/providers/aws/guide/mcp).** You write a standard MCP SDK module; the Framework owns the endpoint, streaming, the Lambda entry, packaging, the authorizer wiring, the OAuth discovery document, and the elicitation signing key. What it never owns is token verification — [enforcement is yours](https://www.serverless.com/framework/docs/providers/aws/guide/mcp#authentication) — so the examples are organized by **where you put it**:

| Example | Where enforcement lives | Reach for it when |
| --- | --- | --- |
| [minimal](minimal) | Nowhere — the endpoint is public | Public tools, or you're just starting |
| [oauth-cognito](oauth-cognito) | API Gateway, validating a Cognito user pool's tokens itself | OAuth with zero verification code — rejection costs no invocation anywhere |
| [oauth-authorizer](oauth-authorizer) | Your own Lambda authorizer, consulted before the server is invoked (Auth0 here) | Any other identity provider, or accept/reject logic of your own |
| [oauth-in-module](oauth-in-module) | Inside your module, with the MCP SDK's own bearer gate | The spec's semantics: `WWW-Authenticate` challenges, scope-aware `403`s, the caller's identity in your tools |

The gateway shapes and the in-module gate compose — cheap rejection in front, the spec's judgement behind it — and interactive browser login (Claude Code discovering the server and logging in itself) is a section of the [oauth-cognito README](oauth-cognito/README.md#interactive-clients-need-a-custom-domain): it needs a root-mapped custom domain, not a different example.

For a different front door, your own bridge code, or per-function control the property does not expose (VPC, layers, provisioned concurrency, a per-function role), see **[custom](custom)** — the same server hosted by hand, one directory per approach.

## Which client can do what

The single most useful thing to know before testing: **not every client reaches every feature**, and the gaps are about the client, not your server. On this hosting (stateless, per-request), the server can only send the client a request — for elicitation, sampling, or roots — when the client speaks the 2026-07-28 revision. Everything request/response works everywhere.

| Client | Tools · resources · prompts | Streamed progress | Elicitation / sampling / roots |
| --- | --- | --- | --- |
| `curl` (raw JSON-RPC) | ✅ | ✅ (read the SSE frames) | ✅ (you hand-write the retry envelope) |
| Official SDK client, default | ✅ | ✅ | ❌ negotiates a legacy revision |
| Official SDK client, `versionNegotiation: { mode: 'auto' }` | ✅ | ✅ | ✅ |
| [MCP Inspector](https://github.com/modelcontextprotocol/inspector) v2, CLI mode (`--cli`) | ✅ | ✅ | ❌ never declares the capability, even with `"protocolEra": "modern"` |
| MCP Inspector v2, browser UI | ✅ | ✅ | ✅ with the connection's **Protocol Era** set to Modern |
| Claude Code CLI | ✅ | ✅ (renders in the terminal) | ✅ only with the 2026-07-28 rollout enabled |

The reason elicitation is gated: on older revisions it is a wire request the server sends *to* the client, and per-request Lambda serving cannot hold a connection open to receive the answer. The 2026-07-28 revision carries the whole exchange in-band (the tool returns `input_required`; the client answers and retries), which survives statelessness — but a client has to opt into that revision. None of the four examples above registers an elicitation tool; the end-to-end walkthrough — a tool pausing for confirmation, sealed state signed with `state: true` — lives in the [MCP guide's Elicitation state chapter](https://www.serverless.com/framework/docs/providers/aws/guide/mcp#elicitation-state), the [custom](custom) family's shared server carries a runnable `approve_refund`, and the script below shows the client side of answering one.

## Testing any example

Every example's README shows the failure shapes and the working calls as real request/response output; the minimal example also walks through the MCP Inspector, and oauth-cognito carries the Claude Code login walkthrough. The runnable official-client script below works against any deployed endpoint — set `ENDPOINT`, and `BEARER` if the server enforces bearer tokens:

```js
// client.mjs — official MCP SDK client, opted into the modern revision
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'

const client = new Client(
  { name: 'example-client', version: '1.0.0' },
  {
    capabilities: { elicitation: { form: {} } },
    versionNegotiation: { mode: 'auto' }, // reach elicitation; omit for legacy
  },
)
// A registered handler answers the server's mid-tool questions locally.
client.setRequestHandler('elicitation/create', async () => ({
  action: 'accept',
  content: { confirmed: true },
}))

const url = new URL(process.env.ENDPOINT)
const transport = new StreamableHTTPClientTransport(url, {
  requestInit: process.env.BEARER
    ? { headers: { authorization: `Bearer ${process.env.BEARER}` } }
    : undefined,
})

await client.connect(transport)
console.log('era', client.getProtocolEra())
console.log('tools', (await client.listTools()).tools.map((t) => t.name))
console.log('add', (await client.callTool({ name: 'add', arguments: { a: 2, b: 40 } })).structuredContent)
await client.close()
```

```bash
npm init -y && npm install @modelcontextprotocol/client
ENDPOINT="https://…/demo/mcp" node client.mjs
```
