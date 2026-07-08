'use strict'

// Minimal sandbox app: an HTTP echo server on :8080.
// Hooks are off by default, so no :9000 hook server is needed.
const http = require('http')

http
  .createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      const payload = { method: req.method, path: req.url, body }
      console.log('APP_REQUEST ' + JSON.stringify(payload))
      const out = JSON.stringify(payload)
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(out),
      })
      res.end(out)
    })
  })
  .listen(8080, '0.0.0.0', () => console.log('BOOT app 0.0.0.0:8080'))
