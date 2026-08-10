<!--
title: 'Bedrock AgentCore: MCP Server from Plain Lambda Functions (JavaScript)'
description: Deploy an MCP server whose tools are plain Lambda functions - no MCP SDK in your code - using Bedrock AgentCore Gateway.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server from Plain Lambda Functions

Deploy a fully managed [Model Context Protocol](https://modelcontextprotocol.io) server whose tools are **plain Lambda functions** — no MCP SDK, no HTTP server, and no protocol code anywhere in your project.

The Serverless Framework provisions a [Bedrock AgentCore Gateway](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html), which *is* the MCP server: an AWS-managed `/mcp` endpoint that answers `tools/list` and `server/discover` itself and performs one Lambda invocation per tool call. Your handlers receive the tool arguments as the event and return the bare result:

```js
export const handler = async (event) => event.a + event.b
```

With `supportedVersions: ['2026-07-28', ...]`, the endpoint serves the stateless MCP protocol revision — self-contained requests with no handshake and no sessions — alongside earlier revisions on the same URL.

**How this differs from the [`mcp-server`](../mcp-server) example:** that one deploys *your own* MCP server (built with the MCP SDK, running as a container on AgentCore Runtime) — full control over the protocol, streaming, and sessions, in exchange for owning the server code. This example inverts the trade: AWS runs the MCP server for you and your code shrinks to plain functions, with the tool schema declared in `serverless.yml`. Pick `mcp-server` when you need SDK-level capabilities; pick this one when your tools are simple request/response functions.

## Usage

### Deploy

```bash
serverless deploy
```

The deploy output prints the gateway's MCP endpoint:

```
agents:
  mcpServer: https://mcp-server-lambda-tools-mcpserver-....gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp
```

### Test

The gateway uses AWS_IAM (SigV4) authorization by default. The included test client signs requests with your local AWS credentials:

```bash
npm install
GATEWAY_URL=<endpoint from deploy output> node test-client.mjs
```

It calls `server/discover`, `tools/list`, and `tools/call`:

```
=== tools/call (calculator___add) -> HTTP 200 ===
{"result":{"isError":false,"content":[{"type":"text","text":"42"}],"resultType":"complete"},...}
```

Note that tool names are namespaced by their gateway target: the `add` tool of the `calculator` target is invoked as `calculator___add`.

### Connect MCP clients

MCP clients such as Claude or AI IDEs authenticate with OAuth rather than SigV4. To support them, configure a JWT authorizer on the gateway (see the commented `authorizer` block in `serverless.yml`) with your OpenID Connect provider's discovery URL — for example an Amazon Cognito user pool.

### Add tools

Each entry in `ai.tools` maps a schema to a function. A single `toolSchema` array can declare multiple tools backed by one function — the invoked tool name is available in `context.clientContext.custom['bedrockAgentCoreToolName']`. Beyond Lambda, gateway tools can also wrap OpenAPI definitions (`openapi: ./spec.yml`) or proxy external MCP servers (`mcp: https://example.com/mcp`).

### Cleanup

```bash
serverless remove
```
