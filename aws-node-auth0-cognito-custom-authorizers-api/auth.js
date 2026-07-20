import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// For Auth0:       https://<project>.auth0.com/
// refer to:        http://bit.ly/2hoeRXk
// For AWS Cognito: https://cognito-idp.<region>.amazonaws.com/<user pool id>
// refer to:        http://amzn.to/2fo77UI
const iss = 'https://<url>.com/';

const client = jwksClient({
  jwksUri: `${iss}.well-known/jwks.json`,
});

// Look up the signing key for the token's `kid` via the issuer's JWKS endpoint:
const getSigningKey = (kid) => new Promise((resolve, reject) => {
  client.getSigningKey(kid, (error, key) => {
    if (error) {
      reject(error);
    } else {
      resolve(key.getPublicKey());
    }
  });
});

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
export const authorize = async (event) => {
  console.log('Auth function invoked');
  if (!event.authorizationToken) {
    console.log('No authorizationToken found in the header.');
    throw new Error('Unauthorized');
  }

  // Remove 'bearer ' from token:
  const token = event.authorizationToken.substring(7);

  try {
    // Decode the token (without verifying) to find which key (`kid`) signed it:
    const decodedHeader = jwt.decode(token, { complete: true });
    const kid = decodedHeader?.header?.kid;
    const signingKey = await getSigningKey(kid);

    // Verify the token:
    const decoded = jwt.verify(token, signingKey, { issuer: iss });
    return generatePolicy(decoded.sub, 'Allow', event.methodArn);
  } catch (err) {
    console.log('Unauthorized user:', err.message);
    throw new Error('Unauthorized');
  }
};
