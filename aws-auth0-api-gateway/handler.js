const jwt = require('jsonwebtoken');

const AUTH0_CLIENT_ID = 'your-auth0-client-id-here';
const AUTH0_CLIENT_SECRET = 'your-auth0-client-secret-here';

// Public API
module.exports.publicEndpoint = (event, context, cb) => {
  cb(null, { message: 'Welcome to our Public API!' });
};

// Private API
module.exports.privateEndpoint = (event, context, cb) => {
  if (event.headers.Authorization) {
    // remove "bearer " from token
    const token = event.headers.Authorization.substring(7);
    const options = {
      audience: AUTH0_CLIENT_ID,
    };
    jwt.verify(token, new Buffer(AUTH0_CLIENT_SECRET, 'base64'), options, (err, decoded) => {
      if (err) {
        cb(null, { message: 'Access denied', token: err });
      } else {
        cb(null, { message: 'Access granted.', token: decoded });
      }
    });
  } else {
    cb(null, { message: 'You must be logged in to access this route! :(' });
  }
};
