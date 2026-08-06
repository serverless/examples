<!--
title: 'AWS MCP Server, minimal (NodeJS)'
description: 'Deploy an MCP server built with the official MCP TypeScript SDK to AWS Lambda with the Serverless Framework - one module, one line of configuration.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server — minimal

The smallest deployable member of the [MCP examples](../README.md): no auth, no domain — the [oauth-cognito](../oauth-cognito), [oauth-authorizer](../oauth-authorizer), and [oauth-in-module](../oauth-in-module) examples each add enforcement in one of its three shapes, and the hub README carries the client-capability matrix that applies to all of them.

Deploy a [Model Context Protocol](https://modelcontextprotocol.io) server, written against the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk), with the Serverless Framework's [built-in MCP server support](https://www.serverless.com/framework/docs/providers/aws/guide/mcp).

There are two files. `src/server.mjs` is a plain SDK server with no Lambda concepts and no Framework APIs in it. `serverless.yml` names it:

```yaml
mcp:
  servers:
    demo:
      server: src/server.mjs
```

That is the whole integration. The Framework owns everything around the module: the HTTPS endpoint at `/demo/mcp` on an API Gateway REST API in streaming mode, the integration timeout kept in step with the function timeout, packaging, and the prebuilt Lambda entry that bridges Lambda's streaming runtime to the SDK handler's web-standard `fetch`. The server becomes an ordinary function in the service model, so `serverless logs -f demo`, metrics, versions, and rollback work with no special casing.

The server exposes two tools, which is enough to see both response modes:

- **`add`** — returns immediately, as plain JSON with structured output.
- **`slow_report`** — works for a while and emits progress notifications, which stream back as `text/event-stream` ahead of the final result.

## Deployment

```bash
npm install
serverless deploy
```

The deploy summary prints the endpoint, and `serverless info` prints it again later:

```
mcp: demo → https://abc123def.execute-api.us-east-1.amazonaws.com/dev/demo/mcp
```

The `dev` segment tracks the stage, so a `--stage` deploy changes every URL below with it. Deploying again without any changes prints `No changes to deploy. Deployment skipped.` — `--force` deploys anyway.

## Testing

Any Streamable HTTP MCP client works. The MCP Inspector's CLI mode takes a config file (`mcp.json` below) naming the endpoint. `"protocolEra": "modern"` opts it into the current protocol revision (its default is an older one) — this server answers without it too; the opt-in starts to matter once a tool depends on the current revision, as elicitation does:

```json
{
  "mcpServers": {
    "demo": {
      "type": "streamable-http",
      "url": "https://abc123def.execute-api.us-east-1.amazonaws.com/dev/demo/mcp",
      "protocolEra": "modern"
    }
  }
}
```

```bash
npx @modelcontextprotocol/inspector --cli \
  --config mcp.json --server demo --method tools/list
```

Without `--cli` the same command opens the Inspector's browser UI, where the opt-in is the connection's **Protocol Era** setting.

`curl` works too — the protocol is JSON-RPC over POST. List the tools:

```bash
curl -s https://abc123def.execute-api.us-east-1.amazonaws.com/dev/demo/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2026-07-28' \
  -H 'mcp-method: tools/list' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}'
```

Call `add` — a tool call also carries the tool name in the `mcp-name` header:

```bash
curl -s https://abc123def.execute-api.us-east-1.amazonaws.com/dev/demo/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2026-07-28' \
  -H 'mcp-method: tools/call' \
  -H 'mcp-name: add' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"add","arguments":{"a":2,"b":40},"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}'
```

```json
{
  "result": {
    "content": [{ "type": "text", "text": "42" }],
    "structuredContent": { "sum": 42 }
  },
  "jsonrpc": "2.0",
  "id": 2
}
```

The response samples on this page are trimmed to the load-bearing keys — the live responses also carry protocol bookkeeping inside `result`: a `resultType` and a `_meta` block naming the server.

Ask `slow_report` for progress — pass a `progressToken` and the response arrives as an event stream, one event per step, with the result last (`-N` keeps `curl` from buffering it):

```bash
curl -sN https://abc123def.execute-api.us-east-1.amazonaws.com/dev/demo/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2026-07-28' \
  -H 'mcp-method: tools/call' \
  -H 'mcp-name: slow_report' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"slow_report","arguments":{"steps":3},"_meta":{"progressToken":"p1","io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}'
```

```
event: message
data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"p1","progress":1,"total":3,"message":"step 1"}}

event: message
data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"p1","progress":2,"total":3,"message":"step 2"}}

event: message
data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"p1","progress":3,"total":3,"message":"step 3"}}

event: message
data: {"result":{"content":[{"type":"text","text":"completed 3 steps"}]},"jsonrpc":"2.0","id":3}
```

The same call without a `progressToken` returns one plain JSON response: both modes live on the one endpoint, and the server picks per request.

## Claude Code

The deployed endpoint is a complete server for any Streamable HTTP client, and Claude Code needs nothing but `--transport http` and the URL — no custom domain, no OAuth flags:

```bash
claude mcp add --transport http demo https://abc123def.execute-api.us-east-1.amazonaws.com/dev/demo/mcp
claude mcp list
```

```
demo: https://abc123def.execute-api.us-east-1.amazonaws.com/dev/demo/mcp (HTTP) - ✔ Connected
```

A headless call proves the round trip without opening the REPL — the phrasing of the reply is the model's and varies run to run; what it reliably carries is the tool's answer, 42:

```bash
claude -p "call the add tool from the demo MCP server with a=2 b=40" --allowedTools "mcp__demo__add"
```

```
`add(a=2, b=40)` → `{"sum": 42}`
```

The custom domain enters the picture only when a server enforces OAuth and a human logs in through the client — that walkthrough is the [oauth-cognito README](../oauth-cognito/README.md#interactive-clients-need-a-custom-domain). `claude mcp remove demo` deregisters it.

## Going further

`serverless.yml` carries the next three steps as commented blocks, each with the reasoning next to it:

- **Authentication** — enforcement is yours; the Framework never verifies tokens. `authorizer` puts your access control at API Gateway, in front of the function — one of your own authorizer functions, a Cognito user pool, or `aws_iam` — and `oauthDiscovery` publishes the protected-resource discovery document that tells clients where to log in. The [oauth-cognito](../oauth-cognito), [oauth-authorizer](../oauth-authorizer), and [oauth-in-module](../oauth-in-module) examples each deploy one enforcement shape end to end.
- **Elicitation state** — `state: true` provisions a signing key in this stack and hands it to the server, so a tool can pause to ask the caller for input and trust what the retry brings back. The caller’s client has to speak the 2026-07-28 protocol revision for that flow — opt-in for clients built on the official SDK (`versionNegotiation: { mode: 'auto' }`); tools that never ask for input need nothing.
- **A custom domain** — `provider.domain` fronts the whole API, MCP servers and `http` functions alike. Mapped at the root, it also puts the discovery document where MCP clients probe for it.

The [MCP guide](https://www.serverless.com/framework/docs/providers/aws/guide/mcp) documents each of these in full, including how the `state` key reaches your module.

## Relationship to the custom hosting examples

The [mcp/custom](https://github.com/serverless/examples/tree/v4/mcp/custom) family hosts the same kind of server by hand, one directory per hosting approach — a written Lambda adapter, Hono, Express or Fastify behind Lambda Web Adapter, API Gateway REST or a Function URL — so you can see and compare the glue. This example is the shortcut: the Framework assembles the Lambda-plus-API-Gateway-streaming hosting for you, so reach for those when you want a different front door or control over the bridge, and for this when you want the endpoint without writing any of it.

## Clean up

```bash
serverless remove
```
