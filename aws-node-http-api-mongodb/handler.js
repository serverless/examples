import mongoose from 'mongoose';
import validator from 'validator';
import UserModel from './model/User.js';

const mongoString = process.env.MONGODB_URI ?? ''; // MongoDB Url

const createErrorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: { 'Content-Type': 'text/plain' },
  body: message || 'Incorrect id',
});

async function withDb(fn) {
  await mongoose.connect(mongoString);
  try {
    return await fn();
  } finally {
    await mongoose.disconnect();
  }
}

export const user = async (event) => {
  if (!validator.isAlphanumeric(event.pathParameters.id)) {
    return createErrorResponse(400, 'Incorrect id');
  }

  try {
    return await withDb(async () => {
      const result = await UserModel.find({ _id: event.pathParameters.id });
      return { statusCode: 200, body: JSON.stringify(result) };
    });
  } catch (err) {
    return createErrorResponse(err.statusCode, err.message);
  }
};

export const createUser = async (event) => {
  const data = JSON.parse(event.body);

  const newUser = new UserModel({
    name: data.name,
    firstname: data.firstname,
    birth: data.birth,
    city: data.city,
    ip: event.requestContext.http?.sourceIp ?? event.requestContext.identity?.sourceIp,
  });

  if (newUser.validateSync()) {
    return createErrorResponse(400, 'Incorrect user data');
  }

  try {
    return await withDb(async () => {
      await newUser.save();
      return { statusCode: 200, body: JSON.stringify({ id: newUser.id }) };
    });
  } catch (err) {
    return createErrorResponse(err.statusCode, err.message);
  }
};

export const deleteUser = async (event) => {
  if (!validator.isAlphanumeric(event.pathParameters.id)) {
    return createErrorResponse(400, 'Incorrect id');
  }

  try {
    return await withDb(async () => {
      await UserModel.deleteOne({ _id: event.pathParameters.id });
      return { statusCode: 200, body: JSON.stringify('Ok') };
    });
  } catch (err) {
    return createErrorResponse(err.statusCode, err.message);
  }
};

export const updateUser = async (event) => {
  const data = JSON.parse(event.body);
  const id = event.pathParameters.id;

  if (!validator.isAlphanumeric(id)) {
    return createErrorResponse(400, 'Incorrect id');
  }

  const updatedUser = new UserModel({
    _id: id,
    name: data.name,
    firstname: data.firstname,
    birth: data.birth,
    city: data.city,
    ip: event.requestContext.http?.sourceIp ?? event.requestContext.identity?.sourceIp,
  });

  if (updatedUser.validateSync()) {
    return createErrorResponse(400, 'Incorrect parameter');
  }

  try {
    return await withDb(async () => {
      await UserModel.findByIdAndUpdate(id, updatedUser);
      return { statusCode: 200, body: JSON.stringify('Ok') };
    });
  } catch (err) {
    return createErrorResponse(err.statusCode, err.message);
  }
};
