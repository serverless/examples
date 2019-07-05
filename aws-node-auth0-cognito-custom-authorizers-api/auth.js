'use strict';

const jwk = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const request = require('request');
const RSAKey = require('rsa-key');

// For Auth0:       https://<project>.auth0.com/ (url should end with '/' )
// refer to:        http://bit.ly/2hoeRXk
// For AWS Cognito: https://cognito-idp.<region>.amazonaws.com/<user pool id> (url should NOT end with '/')
// refer to:        http://amzn.to/2fo77UI

const iss = 'https://<url>.com/';

// Generate policy to allow this user on this API:
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.authorize = (event, context, cb) => {
  console.log('Auth function invoked');
  if (event.authorizationToken) {
    // Remove 'bearer ' from token:
    const token = event.authorizationToken.substring(7);

    // Make a request to the iss + .well-known/jwks.json URL:
    request(
      { url: (iss[iss.length-1] == '/') ? (iss+'.well-known/jwks.json') : (iss+'/.well-known/jwks.json'), json: true },
      (error, response, body) => {
        if (error || response.statusCode !== 200) {
          console.log('Request error:', error);
          cb('Unauthorized');
        }
        const keys = body;
        // Based on the JSON of `jwks` create a Pem:
        const k = keys.keys[keys.keys.length-1];
        const jwkArray = {
          kty: k.kty,
          n: k.n,
          e: k.e,
        };
        const pem = jwkToPem(jwkArray);

        const key = new RSAKey(pem);
        const cert = key.exportKey();

        // Verify the token:
        jwk.verify(token, cert, { issuer: iss }, (err, decoded) => {
          if (err) {
            console.log('Unauthorized user:', err.message);
            cb('Unauthorized');
          } else {
            cb(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
          }
        });
      });
  } else {
    console.log('No authorizationToken found in the header.');
    cb('Unauthorized');
  }
};
