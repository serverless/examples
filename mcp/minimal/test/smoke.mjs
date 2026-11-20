// Lists the deployed MCP server's tools and calls `add`, speaking JSON-RPC over
// HTTP the way the README's curl commands do. Run by the example test runner,
// which passes the stack outputs in EXAMPLE_OUTPUTS. The server is served at
// /demo/mcp under the REST API's ServiceEndpoint output.

const PROTOCOL_VERSION = '2026-07-28';
const RETRY_WINDOW_MS = 60_000;
const RETRY_DELAY_MS = 3_000;

const outputs = JSON.parse(process.env.EXAMPLE_OUTPUTS ?? '{}');
if (!outputs.ServiceEndpoint) fail('stack output ServiceEndpoint not found');
const endpoint = `${outputs.ServiceEndpoint.replace(/\/+$/, '')}/demo/mcp`;

const meta = {
  'io.modelcontextprotocol/protocolVersion': PROTOCOL_VERSION,
  'io.modelcontextprotocol/clientInfo': { name: 'smoke-test', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': {},
};

const listed = await rpc(1, 'tools/list', { _meta: meta });
const names = (listed.tools ?? []).map((t) => t.name);
for (const want of ['add', 'slow_report']) {
  if (!names.includes(want)) fail(`tools/list: expected a tool named ${want}; got ${JSON.stringify(names)}`);
}

const called = await rpc(2, 'tools/call', { name: 'add', arguments: { a: 2, b: 40 }, _meta: meta }, 'add');
if (called.structuredContent?.sum !== 42 || called.content?.[0]?.text !== '42') {
  fail(`tools/call add(2, 40): expected structuredContent.sum 42 and text "42"; got ${JSON.stringify(called)}`);
}

console.log(`${endpoint}: tools ${names.join(', ')}; add(2, 40) = 42`);

// Sends one JSON-RPC request and returns its `result`. Retries network errors
// and 5xx answers for up to RETRY_WINDOW_MS, since a new API can take a moment.
async function rpc(id, method, params, toolName) {
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    'mcp-protocol-version': PROTOCOL_VERSION,
    'mcp-method': method,
  };
  if (toolName) headers['mcp-name'] = toolName;
  const body = JSON.stringify({ jsonrpc: '2.0', id, method, params });

  const start = Date.now();
  let res;
  let text;
  for (;;) {
    let last;
    try {
      res = await fetch(endpoint, { method: 'POST', headers, body });
      text = await res.text();
      if (res.status < 500) break;
      last = `status ${res.status}, body ${text.slice(0, 300)}`;
    } catch (err) {
      last = `request error: ${err.message}`;
    }
    if (Date.now() - start >= RETRY_WINDOW_MS) fail(`${method}: no answer from ${endpoint}; last response: ${last}`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
  if (res.status !== 200) fail(`${method}: expected status 200; got ${res.status}, body ${text.slice(0, 300)}`);

  const message = (res.headers.get('content-type') ?? '').includes('text/event-stream') ? fromEventStream(text, id) : parse(text, method);
  if (message?.error) fail(`${method}: JSON-RPC error ${JSON.stringify(message.error)}`);
  if (message?.id !== id || message.result === undefined) fail(`${method}: expected a result for request ${id}; got ${text.slice(0, 300)}`);
  return message.result;
}

// Returns the event-stream message that answers request `id`.
function fromEventStream(text, id) {
  const messages = text
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => parse(line.slice('data:'.length).trim(), 'event stream'));
  return messages.find((m) => m.id === id);
}

function parse(text, what) {
  try {
    return JSON.parse(text);
  } catch {
    return fail(`${what}: response is not JSON: ${text.slice(0, 300)}`);
  }
}

function fail(message) {
  console.error(`smoke test failed: ${message}`);
  process.exit(1);
}
