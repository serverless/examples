/**
 * A plain Lambda handler exposed as an MCP tool through AgentCore Gateway.
 *
 * The Gateway passes the tool's input arguments as the event and embeds the
 * return value as the MCP tool result - return the bare result directly.
 *
 * When one function backs multiple tools, the invoked tool name arrives in
 * context.clientContext.custom['bedrockAgentCoreToolName'] in the form
 * `<target>___<tool>` (for example `calculator___add`).
 */
export const handler = async (event, context) => {
  const { a, b } = event
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('a and b must be numbers')
  }
  // `<target>___<tool>` - branch on the tool name when one function backs
  // several tools:
  const tool = context.clientContext?.custom?.bedrockAgentCoreToolName ?? ''
  if (tool.endsWith('___multiply')) return a * b
  return a + b
}
