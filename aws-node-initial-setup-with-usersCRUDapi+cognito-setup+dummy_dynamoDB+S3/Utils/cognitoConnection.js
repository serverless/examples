const { REGION } = process.env;

const AWS = require("aws-sdk");
const cognitoIdentityService = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
  region: REGION
});

module.exports = {
  cognitoIdentityService
};
