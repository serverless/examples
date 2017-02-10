'use strict';

function cron() {
  const time = new Date();
  const name = '__OW_ACTION_NAME';
  console.log(`Your cron function "${process.env[name]}" ran at ${time}`);
}

module.exports.cron = cron;
