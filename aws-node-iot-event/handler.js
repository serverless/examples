'use strict';

module.exports.log = (event, context, callback) => {
  // eslint-disable-next-line no-console
  console.log(event);
  callback(null, {});
};
