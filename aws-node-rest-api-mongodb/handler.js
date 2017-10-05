const mongoose = require('mongoose');
const bluebird = require('bluebird');
const validator = require('validator');
const UserModel = require('./model/User.js');

mongoose.Promise = bluebird;

const mongoString = ''; // MongoDB Url

const createErrorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: { 'Content-Type': 'text/plain' },
  body: message || 'Incorrect id',
});

module.exports.user = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const id = event.pathParameters.id;

  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect id'));
    db.close();
    return;
  }

  db.once('open', () => {
    UserModel
      .find({ _id: event.pathParameters.id })
      .then((user) => {
        callback(null, { statusCode: 200, body: JSON.stringify(user) });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        // Close db connection or node event loop won't exit , and lambda will timeout
        db.close();
      });
  });
};


module.exports.createUser = (event, context, callback) => {
  let db = {};
  let data = {};
  let errs = {};
  let user = {};
  const mongooseId = '_id';

  db = mongoose.connect(mongoString).connection;

  data = JSON.parse(event.body);

  user = new UserModel({ name: data.name,
    firstname: data.firstname,
    birth: data.birth,
    city: data.city,
    ip: event.requestContext.identity.sourceIp });

  errs = user.validateSync();

  if (errs) {
    console.log(errs);
    callback(null, createErrorResponse(400, 'Incorrect user data'));
    db.close();
    return;
  }


  db.once('open', () => {
    user
      .save()
      .then(() => {
        callback(null, { statusCode: 200, body: JSON.stringify({ id: user[mongooseId] }) });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        db.close();
      });
  });
};

module.exports.deleteUser = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const id = event.pathParameters.id;

  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect id'));
    db.close();
    return;
  }

  db.once('open', () => {
    UserModel
      .remove({ _id: event.pathParameters.id })
      .then(() => {
        callback(null, { statusCode: 200, body: JSON.stringify('Ok') });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        db.close();
      });
  });
};

module.exports.updateUser = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const data = JSON.parse(event.body);
  const id = event.pathParameters.id;
  let errs = {};
  let user = {};

  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect id'));
    db.close();
    return;
  }

  user = new UserModel({ _id: id,
    name: data.name,
    firstname: data.firstname,
    birth: data.birth,
    city: data.city,
    ip: event.requestContext.identity.sourceIp });

  errs = user.validateSync();

  if (errs) {
    callback(null, createErrorResponse(400, 'Incorrect parameter'));
    db.close();
    return;
  }

  db.once('open', () => {
    // UserModel.save() could be used too
    UserModel.findByIdAndUpdate(id, user)
      .then(() => {
        callback(null, { statusCode: 200, body: JSON.stringify('Ok') });
      })
      .catch((err) => {
        callback(err, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        db.close();
      });
  });
};
