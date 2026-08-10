# MCP Server from Plain Lambda Functions (AgentCore Gateway)

This example lives at [`aws-bedrock-agentcore/javascript/mcp-server-lambda-tools`](../../aws-bedrock-agentcore/javascript/mcp-server-lambda-tools) (kept with the AgentCore example family).

It inverts the trade the other examples in this directory make: AWS runs the MCP server (Bedrock AgentCore Gateway) and your code shrinks to plain Lambda functions, with the tool schema declared in `serverless.yml` - no MCP SDK in your code at all. The trade-offs (tool naming, no streaming or elicitation from Lambda-backed tools) are covered in the [comparison table](../README.md).
