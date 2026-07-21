import jwt from 'jsonwebtoken';

// Set in `environment` of serverless.yml
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY;

// Policy helper function
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
export const auth = async (event) => {
  console.log('event', event);
  if (!event.authorizationToken) {
    throw new Error('Unauthorized');
  }

  const tokenParts = event.authorizationToken.split(' ');
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    throw new Error('Unauthorized');
  }
  const options = {
    audience: AUTH0_CLIENT_ID,
  };

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(tokenValue, AUTH0_CLIENT_PUBLIC_KEY, options, (verifyError, result) => {
        if (verifyError) {
          reject(verifyError);
        } else {
          resolve(result);
        }
      });
    });
    // is custom authorizer function
    console.log('valid from customAuthorizer', decoded);
    return generatePolicy(decoded.sub, 'Allow', event.methodArn);
  } catch (err) {
    console.log('Token invalid.', err);
    throw new Error('Unauthorized');
  }
};

// Public API
export const publicEndpoint = async () => ({
  statusCode: 200,
  headers: {
    /* Required for CORS support to work */
    'Access-Control-Allow-Origin': '*',
    /* Required for cookies, authorization headers with HTTPS */
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify({
    message: 'Hi ⊂◉‿◉つ from Public API',
  }),
});

// Private API
export const privateEndpoint = async () => ({
  statusCode: 200,
  headers: {
    /* Required for CORS support to work */
    'Access-Control-Allow-Origin': '*',
    /* Required for cookies, authorization headers with HTTPS */
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify({
    message: 'Hi ⊂◉‿◉つ from Private API. Only logged in users can see this',
  }),
});
