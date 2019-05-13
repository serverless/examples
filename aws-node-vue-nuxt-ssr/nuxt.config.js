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

  srcDir: 'client/',

  modules: [
    '@nuxt/http',
  ],

  http: {
    baseURL: 'https://api.thedogapi.com/v1/',
  },

  render: {
    compressor: false,
  },
};
