'use strict'

const http = require('http')

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
  })
}

// Application server on :8080 — echoes the request and the GREETING env var.
// Callers reach this port through the MicroVM proxy.
http
  .createServer(async (req, res) => {
    const body = await readBody(req)
    const payload = {
      method: req.method,
      path: req.url,
      headers: req.headers,
      body,
      GREETING: process.env.GREETING || '<unset>',
    }
    console.log('APP_REQUEST ' + JSON.stringify(payload))
    const out = JSON.stringify(payload)
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(out),
    })
    res.end(out)
  })
  .listen(8080, '0.0.0.0', () => console.log('BOOT app 0.0.0.0:8080'))

// Lifecycle-hook server on :9000 — the platform POSTs ready/run/etc. here.
// Each enabled hook must return 200 within its configured timeout.
http
  .createServer(async (req, res) => {
    const body = await readBody(req)
    const hook = req.url.split('/').pop()
    console.log(`HOOK ${hook} body=${body}`)
    res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': 2 })
    res.end('{}')
  })
  .listen(9000, '0.0.0.0', () => console.log('BOOT hooks 0.0.0.0:9000'))
