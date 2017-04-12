

// CREATE DOMAIN
// EXPECTS DATA IN FORMAT:
// domain/ POST
/*
  {
    domain: <domain>
  }
*/
module.exports.create = function(context, event, callback) {

  const simpledb = new AWS.SimpleDB();

  const data = event;

  if(!data.domain){
    console.log('Create domain failed, domain not provided');
    callback(new Error('Couldn\'t create domain.'), null);
    return;
  }

  var params = {
    DomainName: data.domain
  };

  simpledb.createDomain(params, function(err, data) {
    if (err) {
      console.error(err);
      callback(new Error('Couldn\'t create domain.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params),
    };

    callback(null, response);
  });

}

// DELETE DOMAIN
// EXPECTS DATA IN FORMAT:
// domain/ DELETE
/*
  {
    domain: <domain>
  }
*/
module.exports.delete = function(context, event, callback) {

  const simpledb = new AWS.SimpleDB();

  const data = event;

  if(!data.domain){
    console.log('Delete domain failed, domain not provided');
    callback(new Error('Couldn\'t delete domain.'), null);
    return;
  }

  var params = {
    DomainName: data.domain
  };

  simpledb.deleteDomain(params, function(err, data) {
    if (err) {
      console.error(err);
      callback(new Error('Couldn\'t delete domain.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params),
    };

    callback(null, response);
  });

}
