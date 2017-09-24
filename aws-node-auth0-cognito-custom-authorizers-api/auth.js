'use strict';

const jwk = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

// For Auth0:       https://<project>.auth0.com/
// refer to:        http://bit.ly/2hoeRXk
// For AWS Cognito: https://cognito-idp.<region>.amazonaws.com/<user pool id>/
// refer to:        http://amzn.to/2fo77UI
const iss = 'https://<url>.com/';

// For Auth0:       https://<project>.auth0.com/.well-known/jwks.json
// refer to:        http://bit.ly/2wedaP0
// For AWS Cognito: https://<project>.<region>.amazonaws.com/<user pool id>/.well-known/jwks.json
// refer to:        http://amzn.to/2fiE55n
// Place the content of the JSON within the `jwks` variable:
const jwks = '<Paste JSON from jwks.json here>';

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
    const keys = JSON.parse(jwks);

    // Based on the JSON of `jwks` create a Pem:
    const k = keys.keys[0];
    const jwkArray = {
      kty: k.kty,
      n: k.n,
      e: k.e,
    };
    const pem = jwkToPem(jwkArray);

    // Verify the token:
    jwk.verify(token, pem, { issuer: iss }, (err, decoded) => {
      if (err) {
        console.log('Unauthorized user.', err.message);
        cb('Unauthorized');
      } else {
        console.log('Authorized user.');
        cb(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
      }
    });
  } else {
    console.log('No authorizationToken was set.');
    cb('Unauthorized');
  }
};
