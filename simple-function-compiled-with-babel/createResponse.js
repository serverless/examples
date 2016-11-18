module.exports = ({ body = {}, statusCode = 200 }) => {
  const response = {
    statusCode,
    body,
  };
  return response;
};
