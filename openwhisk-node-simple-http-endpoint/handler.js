'use strict';

const moment = require('moment-timezone');

function time(params) {
  const timezone = params.timezone || 'Europe/London';
  const timestr = moment().tz(timezone).format('HH:MM:ss');

  return { payload: `The time in ${timezone} is: ${timestr}.` };
}

module.exports.time = time;
