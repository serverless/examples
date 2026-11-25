exports.run = async () => {
  const time = new Date();
  console.log(`Your cron function ran at ${time}`);
};

exports.cron = async () => {
  const time = new Date();
  console.log(`Your weekday cron function ran at ${time}`);
};
