// Three endpoints of one REST API. API Gateway runs the JWT authorizer before
// `me` and `account` are called, so a request that reaches them carries a
// token it has already validated.

export const hello = async () => respond({ message: 'Hello from a public endpoint. No token needed.' });

export const me = async (event) => respond({ message: 'Hello from an endpoint that takes an ID token.', caller: caller(event) });

export const account = async (event) =>
  respond({ message: 'Hello from an endpoint that takes an access token with a scope.', caller: caller(event) });

// The caller's identity, from the claims of the validated token.
function caller(event) {
  // API Gateway passes the claims in requestContext.authorizer.claims. This is
  // rolling out across AWS Regions: where it hasn't arrived, `authorizer` is
  // null, and the claims are read from the token in the Authorization header,
  // which API Gateway validated before it called the function.
  const fromAuthorizer = event.requestContext?.authorizer?.claims;
  const claims = fromAuthorizer ?? claimsOfToken(event.headers);
  if (!claims) return null;
  return {
    sub: claims.sub,
    // ID tokens name the user in `cognito:username`, access tokens in `username`.
    username: claims['cognito:username'] ?? claims.username,
    tokenUse: claims.token_use,
    scope: claims.scope,
    claimsFrom: fromAuthorizer ? 'requestContext.authorizer.claims' : 'Authorization header',
  };
}

// The payload of the JWT in the Authorization header, with or without a
// `Bearer ` prefix. It does not check the token: API Gateway did.
function claimsOfToken(headers) {
  const header = Object.entries(headers ?? {}).find(([name]) => name.toLowerCase() === 'authorization')?.[1];
  const payload = header?.replace(/^bearer\s+/i, '').split('.')[1];
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function respond(body) {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}
