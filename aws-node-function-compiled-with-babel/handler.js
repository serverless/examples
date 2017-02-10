const createResponse = require('./createResponse');

module.exports.hello = (event, context, callback) => {
  const response = createResponse({ body: { message: 'Success!' } });
  console.log({ response });
  callback(null, response);
};
