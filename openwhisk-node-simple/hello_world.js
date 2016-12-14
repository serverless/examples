'use strict';

function main(params) {
  const name = params.name || 'World';
  return { payload: `Hello, ${name}!` };
}

exports.handler = main;
