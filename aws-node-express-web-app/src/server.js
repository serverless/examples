import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express on AWS Lambda Web Functions!' })
})

app.get('/hello/:name', (req, res) => {
  res.json({ message: `Hello, ${req.params.name}!` })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
