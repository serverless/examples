<!--
title: 'Bedrock AgentCore: Standalone MCP Server (JavaScript)'
description: Standalone JavaScript MCP server deployed to AWS Bedrock AgentCore Runtime, consumable by any MCP client.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server Example

A JavaScript MCP server deployed to AWS Bedrock AgentCore Runtime. Exposes simple tools via the [Model Context Protocol](https://modelcontextprotocol.io/) that can be consumed by any MCP client (Cursor, Claude Desktop, Amazon Q CLI, etc.).

## Tools

| Tool               | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `add`              | Add two numbers together                               |
| `multiply`         | Multiply two numbers together                          |
| `get_current_time` | Get the current date and time (with optional timezone) |

## Prerequisites

- Node.js 24.x
- AWS account with credentials configured
- Serverless Framework installed (`npm i -g serverless`)

## Project structure

```text
mcp-server/
├── index.js          # MCP server (official MCP SDK v2 + node:http)
├── package.json      # Dependencies and start script
├── serverless.yml    # Serverless Framework configuration
└── README.md
```

## Deploy

```bash
npm install
sls deploy
```

## Test

The deploy output prints the runtime's MCP endpoint URL. The test script calls it directly - the same way real MCP clients connect - signing requests with your local AWS credentials (SigV4, the runtime's default inbound auth):

```bash
ENDPOINT=<agent URL from deploy output> node test-invoke.js
```

```
=== tools/call: add({"a":5,"b":3}) ===
  Result: 8
  Structured: {"sum":8}
```

Note the `requestHeaders.allowlist` block in `serverless.yml`: protocol revision `2026-07-28` requires the `Mcp-Method` and `Mcp-Name` headers on every request, and the allowlist forwards them to the container.

## Test

The deploy output prints the runtime's MCP endpoint URL. The test script calls it directly - the same way real MCP clients connect - signing requests with your local AWS credentials (SigV4, the runtime's default inbound auth):

```bash
ENDPOINT=<agent URL from deploy output> node test-invoke.js
```

```
=== tools/call: add({"a":5,"b":3}) ===
  Result: 8
  Structured: {"sum":8}
```

Note the `requestHeaders.allowlist` block in `serverless.yml`: protocol revision `2026-07-28` requires the `Mcp-Method` and `Mcp-Name` headers on every request, and the allowlist forwards them to the container.

## Local development

```bash
npm install
sls dev
```

## How it works

The server is built with the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) v2: `createMcpHandler` produces a web-standard handler serving the stateless MCP `2026-07-28` protocol revision (self-contained requests, `server/discover`, structured results) while answering older MCP clients through the SDK's built-in fallback on the same endpoint. `toNodeHandler` mounts it on a plain `node:http` server at `/mcp` on port 8000, the standard expected by AgentCore Runtime for MCP-protocol runtimes. The Runtime adds an `Mcp-Session-Id` header for its own session isolation; the stateless server accepts and ignores it.

The `serverless.yml` sets `protocol: MCP` on the agent, which tells AgentCore to route MCP traffic to the runtime.

Commented blocks in `index.js` show optional capabilities to enable: progress notifications streamed over SSE from long-running tools, elicitation (a tool pausing to ask the user for input), and resources.

**Related example:** [`mcp-server-lambda-tools`](../mcp-server-lambda-tools) inverts this trade — AWS runs the MCP server (AgentCore Gateway) and your code shrinks to plain Lambda functions with the tool schema declared in `serverless.yml`. Pick this example when you need full SDK-level control; pick that one for simple request/response tools with no MCP code at all.

## Connecting MCP clients

Once deployed, the runtime can be connected to any MCP client that supports remote MCP servers via Streamable HTTP. Refer to the [AgentCore MCP documentation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-mcp.html) for invocation details and authentication setup.
