# MCP Server on AgentCore Runtime

This example lives at [`aws-bedrock-agentcore/javascript/mcp-server`](../../aws-bedrock-agentcore/javascript/mcp-server) (kept with the AgentCore example family).

It serves the same canonical MCP server as the examples in this directory, hosted on AWS Bedrock AgentCore Runtime: the server runs as a plain HTTP container - no Lambda adapter at all - with managed scaling, session isolation, and config-only platform OAuth (`authorizer.jwt`). See the [comparison table](../README.md) for how it stacks up against the Lambda-based options.
