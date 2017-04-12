'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

// CREATE DOMAIN
// EXPECTS DATA IN FORMAT:
// domain/ POST
/*
  {
    domain: <domain>
  }
*/
module.exports.create = (context, event, callback) => {
  const data = event;

  if (!data.domain) {
    console.log('Create domain failed, domain not provided');
    callback(new Error('Couldn\'t create domain.'), null);
    return;
  }

  const params = {
    DomainName: data.domain,
  };

  // query+callback
  const simpledb = new AWS.SimpleDB();
  simpledb.createDomain(params, (err) => {
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
};


// DELETE DOMAIN
// EXPECTS DATA IN FORMAT:
// domain/ DELETE
/*
  {
    domain: <domain>
  }
*/
module.exports.delete = (context, event, callback) => {
  const simpledb = new AWS.SimpleDB();

  const data = event;

  if (!data.domain) {
    console.log('Delete domain failed, domain not provided');
    callback(new Error('Couldn\'t delete domain.'), null);
    return;
  }

  const params = {
    DomainName: data.domain,
  };

  simpledb.deleteDomain(params, (err) => {
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
};
