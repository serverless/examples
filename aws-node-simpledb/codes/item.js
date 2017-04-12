
var AWS = require('aws-sdk');

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
module.exports.create = function(event, context, callback) {

  if(event === undefined){
    console.log('Create item failed, no data provided.');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  const data = event;

  if(!data.domain){
    console.log('Create item failed, domain not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if(!data.itemname){
    console.log('Create item failed, itemname not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if(!data.attributes){
    console.log('Create item failed, attributes not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if(Object.keys(data.attributes).length === 0){
    console.log('Create item failed, attributes provided, but empty');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  var attributes = [];

  for (var key in data.attributes) {
    if (data.attributes.hasOwnProperty(key)) {
      attributes.push(
        {
          Name: key,
          Value: data.attributes[key]
        }
      )
    }
  }

  var params = {
    DomainName: data.domain,
    ItemName: data.itemname,
    Attributes: attributes
  };

  // query + callback
  const simpledb = new AWS.SimpleDB();
  simpledb.putAttributes(params, function(error, result) {

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
}

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
module.exports.get = function(event, context, callback) {

  if(event === undefined){
    console.log('Get item failed, no data provided.');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  const data = event;

  if(!data.domain){
    console.log('Create item failed, domain not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if(!data.itemname){
    console.log('Get item failed, itemname not provided');
    callback(new Error('Couldn\'t get item.'), null);
    return;
  }

  if(data.attributes){
    if(data.attributes.length === 0){
      console.log('Get item failed, attributes provided, but empty');
      callback(new Error('Couldn\'t get item.'), null);
      return;
    }
  }

  var params = {
    DomainName: data.domain,
    ItemName: data.itemname,
    ConsistentRead: true
  };

  if(data.attributes.length > 0){
    params["AttributeNames"] = data.attributes
  }

  // query and handle
  const simpledb = new AWS.SimpleDB();
	simpledb.getAttributes(params, function(err, result){

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
}


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
module.exports.update = function(event, context, callback) {

  if(event === undefined){
    console.log('Update item failed, no data provided.');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  const data = event;

  if(!data.domain){
    console.log('Create item failed, domain not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if(!data.itemname){
    console.log('Update item failed, itemname not provided');
    callback(new Error('Couldn\'t update item.'), null);
    return;
  }

  if(!data.attributes){
    console.log('Update item failed, attributes not provided');
    callback(new Error('Couldn\'t update item.'), null);
    return;
  }

  if(Object.keys(data.attributes).length === 0){
    console.log('Update item failed, attributes provided, but empty');
    callback(new Error('Couldn\'t update item.'), null);
    return;
  }

  var attributes = [];

  for (var key in data.attributes) {
    if (data.attributes.hasOwnProperty(key)) {
      attributes.append(
        {
          Name: key,
          Value: data.attributes[key]
        }
      )
    }
  }


  var params = {
    DomainName: data.domain,
    ItemName: data.itemname,
    Attributes: attributes
  };

  // query + callback
  const simpledb = new AWS.SimpleDB();
  simpledb.putAttributes(params, function(err, result) {

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
}

// DELETE ITEM
// EXPECTS DATA IN FORMAT:
// item/{domain}/{itemname} DELETE
/*
  {
    domain: <domain>,
    itemname: <itemname>,
    attributes: [<attribute_name>, <attribute_name>, ...] (optional, if not provided, entire item will be deleted)
  }
*/
module.exports.delete = function(event, context, callback) {

  if(event === undefined){
    console.log('Delete item failed, no data provided.');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  const data = event;

  if(!data.domain){
    console.log('Create item failed, domain not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if(!data.itemname){
    console.log('Delete item failed, itemname not provided');
    callback(new Error('Couldn\'t delete item.'), null);
    return;
  }

  if(data.attributes){
    if(data.attributes.length === 0){
      console.log('Delete item failed, attributes provided, but empty');
      callback(new Error('Couldn\'t delete item.'), null);
      return;
    }
  }

  var params = {
    DomainName: event.domain,
    ItemName: event.itemname,
  };

  var attributes = [];

  if(data.attributes){
    for (var key in data.attributes) {
      attributes.append(
        {
          Name: key
        }
      )
    }
    params["Attributes"] = attributes;
  }

  // query + callback
  const simpledb = new AWS.SimpleDB();
  simpledb.deleteAttributes(params, function(err, result) {
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
}

// SELECT ITEM(S)
// EXPECTS DATA IN FORMAT:
// item/select/{domain} GET
/*
  {
    domain: <domain>,
    select: <select expression>
  }
*/
module.exports.select = function(event, context, callback) {

  if(event === undefined){
    console.log('Select failed, no data provided.');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  const data = event;

  if(!data.domain){
    console.log('Create item failed, domain in path not provided');
    callback(new Error('Couldn\'t create item.'), null);
    return;
  }

  if(!data.select){
    console.log('Select failed, select expression not provided');
    callback(new Error('Couldn\'t select.'), null);
    return;
  }

  var params = {
    Domain: data.domain,
    SelectExpression: data.select,
    ConsistentRead: true
  };

  // query+callback
  const simpledb = new AWS.SimpleDB();
  simpledb.select(params, function(err, data) {
    if (err) {
      console.error(err);
      callback(new Error('Couldn\'t select.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(data),
    };

    callback(null, response);
  });

}
