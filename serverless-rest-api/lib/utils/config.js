module.exports = () => {

  let config;
  let envPath = '../../env.json';

  try {
    config = require(envPath) || {};
  } catch (e) {
    console.log('Could not load ' + envPath, e);
  }

  process.env.appStage = config && config.stage ? config.stage : 'dev';
}
