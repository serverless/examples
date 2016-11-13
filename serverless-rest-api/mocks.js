// Users - Create
module.exports.create_success = function() {
  let email = 'mock_' + generateRandomString() + '@example.com';
  return {
    email: email
  };
}

module.exports.create_error_missing_email = function() {
  return {};
}

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 7; i++ )
  text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
