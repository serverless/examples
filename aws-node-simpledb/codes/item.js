'use strict';

const AWS = require('aws-sdk');

// CREATE ITEM
// EXPECTS DATA IN FORMAT :
// item/{domain} POST
/*
  {
    domain: <domain>,
    itemname: <itemname>,
    attributes: {
      <attribute_name>: <attribute_value>,
      <attribute_name>: <attribute_value>,
      ...
    }
  }
*/
module.exports.create = (event, context, callback) => {
  if (event === undefined) {
    console.log('Create item failed, no data provided.');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  const data = event;

  if (!data.domain) {
    console.log('Create item failed, domain not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if (!data.itemname) {
    console.log('Create item failed, itemname not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if (!data.attributes) {
    console.log('Create item failed, attributes not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if (Object.keys(data.attributes).length === 0) {
    console.log('Create item failed, attributes provided, but empty');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  const attributes = [];

  Object.keys(data.attributes).forEach(key =>
    attributes.push({
      Name: key,
      Value: data.attributes[key],
    }),
  );

  const params = {
    DomainName: data.domain,
    ItemName: data.itemname,
    Attributes: attributes,
  };

  // query + callback
  const simpledb = new AWS.SimpleDB();
  simpledb.putAttributes(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the item.'));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params),
    };
    callback(null, response);
  });
};

// GET ITEM
// EXPECTS DATA IN FORMAT :
// item/{domain}/{itemname} GET
/*
  {
    domain: <domain>,
    itemname: <itemname>,
    attributes: [<attribute>, <attribute>, ...] (optional)
  }
*/
module.exports.get = (event, context, callback) => {
  if (event === undefined) {
    console.log('Get item failed, no data provided.');
    callback(new Error('Couldn\'t get item.'), null);
    return;
  }

  const data = event;

  if (!data.domain) {
    console.log('Get item failed, domain not provided');
    callback(new Error('Couldn\'t get item.'), null);
    return;
  }

  if (!data.itemname) {
    console.log('Get item failed, itemname not provided');
    callback(new Error('Couldn\'t get item.'), null);
    return;
  }

  if (data.attributes) {
    if (data.attributes.length === 0) {
      console.log('Get item failed, attributes provided, but empty');
      callback(new Error('Couldn\'t get item.'), null);
      return;
    }
  }

  const params = {
    DomainName: data.domain,
    ItemName: data.itemname,
    ConsistentRead: true,
  };

  if (data.attributes.length > 0) {
    params.AttributeNames = data.attributes;
  }

  // query and handle
  const simpledb = new AWS.SimpleDB();
  simpledb.getAttributes(params, (err, result) => {
    if (err) {
      console.error(err);
      callback(new Error('Couldn\'t get the item.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result),
    };

    callback(null, response);
  });
};


// UPDATE ITEM
// EXPECTS DATA IN FORMAT:
// item/{domain}/{itemname} POST
/*
  {
    domain: <domain>,
    itemname: <itemname>,
    attributes:{
      <attribute_name>: <attribute_value>,
      <attribute_name>: <attribute_value>,
      ...
    }
  }
*/
module.exports.update = (event, context, callback) => {
  if (event === undefined) {
    console.log('Update item failed, no data provided.');
    callback(new Error('Couldn\'t update item.'), null);
    return;
  }

  const data = event;

  if (!data.domain) {
    console.log('Update item failed, domain not provided');
    callback(new Error('Couldn\'t update item.'), null);
    return;
  }

  if (!data.itemname) {
    console.log('Update item failed, itemname not provided');
    callback(new Error('Couldn\'t update item.'), null);
    return;
  }

  if (!data.attributes) {
    console.log('Update item failed, attributes not provided');
    callback(new Error('Couldn\'t update item.'), null);
    return;
  }

  if (Object.keys(data.attributes).length === 0) {
    console.log('Update item failed, attributes provided, but empty');
    callback(new Error('Couldn\'t update item.'), null);
    return;
  }

  const attributes = [];

  Object.keys(data.attributes).forEach(key =>
    attributes.push({
      Name: key,
      Value: data.attributes[key],
    }),
  );

  const params = {
    DomainName: data.domain,
    ItemName: data.itemname,
    Attributes: attributes,
  };

  // query + callback
  const simpledb = new AWS.SimpleDB();
  simpledb.putAttributes(params, (err) => {
    // handle potential errors
    if (err) {
      console.error(err);
      callback(new Error('Couldn\'t update the item.'));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params),
    };
    callback(null, response);
  });
};

// DELETE ITEM
// EXPECTS DATA IN FORMAT:
// item/{domain}/{itemname} DELETE
/*
  {
    domain: <domain>,
    itemname: <itemname>,
    attributes: [<attribute_name>, <attribute_name>, ...] (optional,
                                  if not provided, entire item will be deleted)
  }
*/
module.exports.delete = (event, context, callback) => {
  if (event === undefined) {
    console.log('Delete item failed, no data provided.');
    callback(new Error('Couldn\'t delete item.'), null);
    return;
  }

  const data = event;

  if (!data.domain) {
    console.log('Delete item failed, domain not provided');
    callback(new Error('Couldn\'t delete item.'), null);
    return;
  }

  if (!data.itemname) {
    console.log('Delete item failed, itemname not provided');
    callback(new Error('Couldn\'t delete item.'), null);
    return;
  }

  if (data.attributes) {
    if (data.attributes.length === 0) {
      console.log('Delete item failed, attributes provided, but empty');
      callback(new Error('Couldn\'t delete item.'), null);
      return;
    }
  }

  const params = {
    DomainName: event.domain,
    ItemName: event.itemname,
  };

  const attributes = [];

  if (data.attributes) {
    Object.keys(data.attributes).forEach(key =>
      attributes.push({
        Name: key,
      }),
    );
    params.Attributes = attributes;
  }

  // query + callback
  const simpledb = new AWS.SimpleDB();
  simpledb.deleteAttributes(params, (err) => {
    if (err) {
      console.error(err);
      callback(new Error('Couldn\'t delete the item.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params),
    };

    callback(null, response);
  });
};

// SELECT ITEM(S)
// EXPECTS DATA IN FORMAT:
// item/select/{domain} GET
/*
  {
    domain: <domain>,
    select: <select expression>
  }
*/
module.exports.select = (event, context, callback) => {
  if (event === undefined) {
    console.log('Select failed, no data provided.');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  const data = event;

  if (!data.domain) {
    console.log('Select failed, domain not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if (!data.select) {
    console.log('Select failed, select expression not provided');
    callback(new Error('Couldn\'t select.'), null);
    return;
  }

  const params = {
    Domain: data.domain,
    SelectExpression: data.select,
    ConsistentRead: true,
  };

  // query+callback
  const simpledb = new AWS.SimpleDB();
  simpledb.select(params, (err, result) => {
    if (err) {
      console.error(err);
      callback(new Error('Couldn\'t select.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result),
    };

    callback(null, response);
  });
};
