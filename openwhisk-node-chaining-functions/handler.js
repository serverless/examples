'use strict';

function chain(parameters) {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const ow = require('openwhisk')();

  const invoke = (actionName, params) => ow.actions.invoke({ actionName, params, blocking: true });
  return invoke('my_service-dev-split', parameters)
    .then(res => invoke('my_service-dev-reverse', res.response.result))
    .then(res => invoke('my_service-dev-join', res.response.result))
    .then(res => res.response.result);
}

module.exports.chain = chain;
