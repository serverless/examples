const sls = require('serverless-http')
const binaryMimeTypes = require('./binaryMimeTypes')

const api = require('./api')
module.exports.api = sls(api, {
  binary: binaryMimeTypes
})

const nuxt = require('./nuxt')
module.exports.nuxt = sls(nuxt, {
  binary: binaryMimeTypes
})
