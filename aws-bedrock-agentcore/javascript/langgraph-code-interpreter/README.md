<!--
title: 'Bedrock AgentCore: LangGraph Agent with Managed Code Interpreter (JavaScript)'
description: LangGraph JS agent using the AWS-managed AgentCore Code Interpreter for sandboxed code execution.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# LangGraph Code Interpreter Example

A LangGraph JavaScript agent with AWS-managed code interpreter for sandboxed code execution.

## Features

- **Sandboxed Execution**: Run Python, JavaScript, or TypeScript in a SANDBOX environment
- **File Operations**: Read, write, and list files in the sandbox
- **Shell Commands**: Execute shell commands
- **LangGraph JS**: ReAct agent pattern with code execution tools

## Tools Available

| Tool              | Description                          |
| ----------------- | ------------------------------------ |
| `execute_code`    | Execute Python/JS/TS code in sandbox |
| `execute_command` | Run shell commands                   |
| `read_files`      | Read file contents                   |
| `write_files`     | Write files                          |
| `list_files`      | List directory contents              |

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

- [langgraph-code-interpreter-custom](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-code-interpreter-custom) - Custom interpreter with PUBLIC network
