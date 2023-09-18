const { putItem, updateItem, deleteItem } = require("../Utils/DBClient");
const { customValidator } = require("../Utils/customValidator");

const {
  createResponse,
  updateResponse,
  okResponse,
  deleteResponse,
  internalServerError,
  badRequestResponse,
  resourceNotFound
} = require("../Utils/responseCodes").responseMessages;

const { cognitoIdentityService } = require("../Utils/cognitoConnection.js");

const { USER_POOL_ID } = process.env;

function deleteCognitoUser(userId) {
  return cognitoIdentityService
    .adminDeleteUser({
      UserPoolId: USER_POOL_ID,
      Username: userId
    })
    .promise()
    .then(result => {
      console.log("result", result);
      return okResponse("user deleted successfully", result);
    })
    .catch(err => {
      console.log("error", err);
      return badRequestResponse("unable to delete cognito user", err);
    });
}

function createUser(event) {
  console.log("Inside createUser Function", event);

  const validationResult = customValidator(event, ["userId", "email", "name"]);
  if (validationResult.length)
    return badRequestResponse("Missing required fields", validationResult);

  const params = {
    TableName: "UsersTable",
    Item: {
      ...event,
      isDeactivated: false
    }
  };

  return putItem(params)
    .then(() =>
      createResponse(
        `user created successfully with userId ${event.userId}`,
        params
      )
    )
    .catch(err =>
      internalServerError(
        err,
        `unable to create user with the email address ${event.email}`
      )
    );
}

function updateUser(event) {
  console.log("Inside updateUser Function", event);

  const validationResult = customValidator(event, ["userId"]);
  if (validationResult.length)
    return badRequestResponse("Missing required fields", validationResult);

  const { userId } = event;

  // email and userId we do not want to let the user to update
  delete event.userId;
  if (event.email) delete event.email;

  // method to capture the updated details dynamically
  let updateExpression = "set";
  let ExpressionAttributeNames = {};
  let ExpressionAttributeValues = {};
  for (const property in event) {
    updateExpression += ` #${property} = :${property} ,`;
    ExpressionAttributeNames["#" + property] = property;
    ExpressionAttributeValues[":" + property] = event[property];
  }

  // removing last comma
  updateExpression = updateExpression.slice(0, -1);

  const params = {
    TableName: "UsersTable",
    Key: {
      userId: userId
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: ExpressionAttributeNames,
    ExpressionAttributeValues: ExpressionAttributeValues
  };

  return updateItem(params)
    .then(() =>
      updateResponse(`user updated successfully with userId ${userId}`, params)
    )
    .catch(err =>
      internalServerError(`Error to update the user ${err}`, params)
    );
}

function deactivateUser(event) {
  console.log("Inside deactivateUser Function", event);

  const validationResult = customValidator(event, ["userId"]);
  if (validationResult.length)
    return badRequestResponse("Missing required fields", validationResult);

  const userParams = {
    TableName: "UsersTable",
    Key: {
      userId: event.userId
    },
    UpdateExpression: "set isDeactivated = :val",
    ExpressionAttributeValues: {
      ":val": true
    }
  };

  return updateItem(userParams)
    .then(async () =>
      deleteResponse(
        `user deactivated successfully with userId ${event.userId}`,
        userParams
      )
    )
    .catch(err =>
      internalServerError(`unable to deactivate the user ${err}`, userParams)
    );
}

function deleteUser(event) {
  console.log("Inside deleteUser Function", event);

  const validationResult = customValidator(event, ["userId"]);
  if (validationResult.length)
    return badRequestResponse("Missing required fields", validationResult);

  const deleteParams = {
    TableName: "UsersTable",
    Key: {
      userId: event.userId
    },
    ConditionExpression: "userId = :userId AND isDeactivated = :val",
    ExpressionAttributeValues: {
      ":userId": event.userId,
      ":val": false
    }
  };

  return deleteItem(deleteParams)
    .then(async () => {
      await deleteCognitoUser(event.useId);
      return deleteResponse(
        `user delete successfully with userId ${event.userId}`,
        userParams
      );
    })
    .catch(err =>
      internalServerError(`unable to delete the user ${err}`, deleteParams)
    );
}

module.exports = { createUser, updateUser, deactivateUser, deleteUser };
