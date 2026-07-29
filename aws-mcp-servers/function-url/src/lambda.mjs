/**
 * Lambda Function URL adapter for a web-standard MCP handler.
 *
 * The MCP SDK's serving entry is a web-standard fetch handler; its
 * @modelcontextprotocol/node package converts Node-style request/response
 * objects to that interface using structural (duck-typed) shapes. A Function
 * URL invocation with response streaming provides exactly such shapes: the
 * HTTP v2 event maps to the request side, and the awslambda response stream
 * maps to the response side. This file is that glue - no MCP logic.
 */
import { toNodeHandler } from '@modelcontextprotocol/node'
import mcpHandler from './server.mjs'

const node = toNodeHandler(mcpHandler)

/** Function URL (HTTP API v2.0) event -> Node-style request */
function toNodeRequest(event) {
  const headers = {}
  for (const [k, v] of Object.entries(event.headers ?? {})) headers[k.toLowerCase()] = v
  if (event.cookies?.length) headers.cookie = event.cookies.join('; ')
  const body =
    event.body == null ? null : Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
  return {
    method: event.requestContext.http.method,
    url: event.rawPath + (event.rawQueryString ? `?${event.rawQueryString}` : ''),
    headers,
    async *[Symbol.asyncIterator]() {
      if (body) yield body
    },
  }
}

/** awslambda response stream -> Node-style response */
function toNodeResponse(rawStream) {
  let target = null // set once the handler calls writeHead
  const pendingListeners = []
  return {
    get destroyed() {
      return (target ?? rawStream).destroyed === true
    },
    writeHead(statusCode, headersRecord = {}) {
      target = awslambda.HttpResponseStream.from(rawStream, { statusCode, headers: headersRecord })
      for (const [event, listener] of pendingListeners) target.on(event, listener)
      return this
    },
    write(chunk) {
      return target.write(chunk) // real booleans keep backpressure working
    },
    end(chunk) {
      return target ? target.end(chunk) : rawStream.end(chunk)
    },
    on(event, listener) {
      ;(target ?? rawStream).on(event, listener)
      if (!target) pendingListeners.push([event, listener])
      return this
    },
  }
}

export const handler = awslambda.streamifyResponse(async (event, responseStream) => {
  const res = toNodeResponse(responseStream)
  const finished = new Promise((resolve, reject) => {
    responseStream.on('close', resolve)
    responseStream.on('finish', resolve)
    responseStream.on('error', reject)
  })
  await node(toNodeRequest(event), res)
  await finished
})
