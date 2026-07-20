<!--
title: Bedrock AgentCore: LangGraph Agent with Custom Code Interpreter (JavaScript)
description: LangGraph JS agent using a custom AgentCore Code Interpreter with PUBLIC network access.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# LangGraph Custom Code Interpreter Example

A LangGraph JavaScript agent with a custom code interpreter that has PUBLIC network access.

## Features

- **PUBLIC Network**: Code can access external APIs (unlike SANDBOX default)
- **Custom Interpreter**: Uses your own interpreter configuration
- **Python Execution**: Run Python code with network access
- **LangGraph JS**: ReAct agent with custom code execution tool

## How It Differs from Default

| Aspect     | Default                  | Custom                           |
| ---------- | ------------------------ | -------------------------------- |
| Network    | SANDBOX (no network)     | PUBLIC (internet access)         |
| Identifier | `aws.codeinterpreter.v1` | Your own interpreter ID          |
| Use case   | Isolated computation     | External API calls, web scraping |

## Quick Start

### Deploy

```bash
npm install
sls deploy
```

### Test

```bash
RUNTIME_ARN=<your-runtime-arn> node test-invoke.js
```

### Remove

```bash
sls remove
```

## Related Examples

- [langgraph-code-interpreter](../langgraph-code-interpreter/) - Default interpreter (SANDBOX)
