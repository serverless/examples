import express from 'express'

const app = express()

// The domain forwards paths unchanged: https://<domain>/api/hello arrives
// here as /api/hello, so every route lives under /api.
const api = express.Router()

api.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from the Express API!',
    // Behind the domain, CloudFront sends the public hostname in X-Forwarded-Host.
    host: req.get('x-forwarded-host') ?? req.get('host'),
    time: new Date().toISOString(),
  })
})

api.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', api)

const port = process.env.PORT ?? 3001

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
