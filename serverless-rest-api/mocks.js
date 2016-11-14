// Users - Create - Success
module.exports.create_success = function() {
  let email = 'mock_' + generateRandomString() + '@example.com';
  return {
    email: email
  };
}

// Users - Create - Error Missing Email
module.exports.create_error_missing_email = function() {
  return {};
}

// Users - Show - Success
module.exports.show_success = function() {
  return { test: 'hello world' }
}

// Utility - Generate Random String
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 7; i++ )
  text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
