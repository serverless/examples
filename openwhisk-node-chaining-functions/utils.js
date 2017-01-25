'use strict';

function split(params) {
  return { message: params.message.split(' ') };
}

function join(params) {
  return { message: params.message.join(' ') };
}

function reverse(params) {
  return { message: params.message.reverse() };
}

module.exports.split = split;
module.exports.join = join;
module.exports.reverse = reverse;
