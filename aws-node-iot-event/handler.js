'use strict';

module.exports.log = (event, context, callback) => {
  console.log(event);
  callback(null, {});
};
