const express = require('express');
const { Nuxt } = require('nuxt');
const path = require('path');
const config = require('./nuxt.config.js');

module.exports = async function() {
  const app = express()
  const nuxt = new Nuxt(config)
  await nuxt.ready()
  app.use('/_nuxt', express.static(path.join(__dirname, '.nuxt', 'dist')))
  app.use(nuxt.render)
  return app
}
