const AWS = require("aws-sdk");
const region = process.env.REGION;
AWS.config.update({ region });
const DBClient = new AWS.DynamoDB.DocumentClient();

//Function for Querying Item From DynamoDB
function queryItem(params) {
  return new Promise((resolve, reject) =>
    DBClient.query(params, function(error, data) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(data.Items);
      }
    })
  );
}

//Function for filtering Item From DynamoDB
function filterItem(params) {
  return new Promise((resolve, reject) =>
    DBClient.scan(params, function(error, data) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(data.Items);
      }
    })
  );
}

//Function for filtering Item From DynamoDB
function filterItemPaginated(params) {
  return new Promise((resolve, reject) =>
    DBClient.scan(params, function(error, data) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(data);
      }
    })
  );
}

//Function for putting Item From DynamoDB
function putItem(params) {
  return new Promise(function(resolve, reject) {
    DBClient.put(params, (error, data) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

//Function for updating Item From DynamoDB
function updateItem(params) {
  return new Promise(function(resolve, reject) {
    DBClient.update(params, (error, data) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

//Function for deleting Item From DynamoDB
function deleteItem(params) {
  return new Promise(function(resolve, reject) {
    DBClient.delete(params, (error, data) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

//Function for BatchWriting Item to DynamoDB
function batchWrite(params) {
  return new Promise(function(resolve, reject) {
    DBClient.batchWrite(params, (error, data) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

//Function for scan item Item to DynamoDB
function scanItem(params) {
  return new Promise(function(resolve, reject) {
    DBClient.scan(params, (error, data) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  DBClient,
  filterItem,
  queryItem,
  putItem,
  updateItem,
  deleteItem,
  batchWrite,
  scanItem,
  filterItemPaginated
};
