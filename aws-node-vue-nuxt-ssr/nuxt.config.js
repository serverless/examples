const env = require('./secrets.json').NODE_ENV;

module.exports = {
  mode: 'universal',
  head: {
    title: 'Vue Nuxt Test',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' },
    ],
  },
  build: {
    vendor: ['axios'],
    publicPath: `/${env}/_nuxt/`,
  },
  srcDir: 'client/',
  performance: {
    gzip: false,
  },
  router: {
    base: '/',
  },
  dev: false,
};
