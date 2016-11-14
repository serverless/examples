'use strict';

/**
* Serverless Helper Library
* - Run functions on AWS Lambda or Google Cloud Functions
**/

const path = require('path');
const context = require('./context');

let serverlessConfig = {
  stage: null,
  region: null
};

/**
* Init
* - Global config settings for Serverless
* - Expects a JSON file
**/
// TODO: Move provider detection in here
const init = (data) => {

  // Load ENV files and add to config
  if (data && data.envFile) {
    let envData = {};
    let envPath = path.join('../', data.envFile);

    for (let i = 0;i < 10;i++) {
      try {
        envPath = path.join('../', envPath);
        envData = require(envPath);
        if (envData) {
          for (let i = 0; i < Object.keys(envData).length; i++) {
            let key = Object.keys(envData)[i]
            serverlessConfig[key] = envData[key];
          }
          break;
        }
      } catch(e) {
        continue;
      }
    }
  }

  // Set config from ENV vars
  // TODO: Write

  // Apply data arguments last. They are treated as overwrites.
  if (data) {
    for (let i = 0; i < Object.keys(data).length; i++) {
      let key = Object.keys(data)[i]
      serverlessConfig[key] = data[key];
    }
  }

  return serverlessConfig;
}

/**
* Sync
* - Handler for a synchronous function
* - Passes in `req` and `res` params
* - Prepares a consistent context across providers
*/

const sync = (fn) => {
  return function() {

    // Prepare context
    let ctx = context(serverlessConfig, arguments, 'sync');

    // Run logic
    try {
      var v = fn.apply(ctx.context, ctx.arguments);
    } catch (e) {

    }
  }
}

/**
* Serverless
**/

const serverless = {
  init: init,
  sync: sync
}

module.exports = serverless;
