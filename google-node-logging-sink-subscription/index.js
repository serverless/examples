'use strict';

const atob = require('atob');

exports.pubSub = (event) => {
  if (event && event.data) {
    const decoded = atob(event.data);
    console.log(decoded);
  }
};
