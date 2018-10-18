const express = require('express');
const { Nuxt } = require('nuxt');
const path = require('path');
const config = require('./nuxt.config.js');

const app = express();
const nuxt = new Nuxt(config);
app.use('/_nuxt', express.static(path.join(__dirname, '.nuxt', 'dist')));
app.use(nuxt.render);

module.exports = app;
