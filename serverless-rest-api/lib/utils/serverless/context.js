'use strict';

/**
* Context
* - Determines a serverless functions provider and reorganizes it
**/

const Req = require('./req');
const Res = require('./res');

/**
* Prepare Context
* - Creates a universal context
* - Creates universal arguments
**/

module.exports = (config, args, fnType) => {

  let runtime = {
    context: {},
    arguments: []
  };

  // Detect AWS Lambda - args['0'] is event, args['1'] is context, args['2'] is callback
  if (args['1'] && args['1'].awsRequestId) {
      runtime.context.provider = 'aws';
      runtime.context.compute = 'lambda';
  }

  // TODO: Detect Google Cloud Functions & others

  // Prepare Arguments
  if (fnType === 'sync') runtime.arguments = prepareSyncArgs(config, args, runtime.context.provider, runtime.context.compute);
  if (fnType === 'async') runtime.arguments = prepareAsyncArgs(config, args, runtime.context.provider, runtime.context.compute);

  return runtime;
}

/**
* Prepare Synchronous Arguments
* - Converts provider arguments to a consistent format: req, res
**/

const prepareSyncArgs = (config, args, provider, compute) => {

  // Declarations
  let req;
  let res;

  // Populate for AWS Lambda
  if (provider === 'aws' && compute === 'lambda') {

    req = new Req(config);
    res = new Res(config, args['2']);

    // Check if body is a string
    if (typeof args['0'] === 'string') args['0'] = JSON.parse(args['0']);

    req.stage = req.set('stage', config.stage ? config.stage : args['1'].requestContext ? args['1'].requestContext.stage : null);
    req.region = req.set('region', config.region);
    req.path = req.set('path', args['1'].path);
    req.method = req.set('method', args['1'].httpMethod);
    req.headers = req.set('headers', args['1'].headers);
    req.body = req.set('body', args['0'] ? args['0'] : {});
    req.query = req.set('query', args['1'].queryStringParameters);
    req.ip = req.set('ip', args['1'].requestContext ? args['1'].requestContext.identity ? args['1'].requestContext.sourceIp : null : null);
    req.host = req.set('host', args['1'].headers ? args['1'].headers.Host : null);
    req.userAgent = req.set('userAgent', args['1'].requestContext ? args['1'].requestContext.userAgent ? args['1'].requestContext.userAgent : null : null);
    req.raw = req.set('raw', args['1']);
  }

  // TODO: Populate for other providers

  return [req, res];
}

/**
* Prepare Asynchronous Arguments
* - Converts provider arguments to a consistent format: req, res
**/

const prepareAsyncArgs = (args, provider, compute) => {
  // TODO: Write for multiple providers
  return [];
}
