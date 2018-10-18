const express = require('express');
const { Nuxt } = require('nuxt');
const path = require('path');

const app = express();

app.use('/_nuxt', express.static(path.join(__dirname, '.nuxt', 'dist')));
const config = require('./nuxt.config.js');

const nuxt = new Nuxt(config);
app.use(nuxt.render);

module.exports = app;
