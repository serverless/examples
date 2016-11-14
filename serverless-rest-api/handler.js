'use strict';

const serverless = require('./lib/utils/serverless');
const users = require('./lib/users');

// Set global config from file and ENV vars
serverless.init({
  envFile: 'env.json'
});

module.exports.create = serverless.sync(users.create);
module.exports.show = serverless.sync(users.show);
module.exports.update = serverless.sync(users.update);
module.exports.delete = serverless.sync(users.delete);
