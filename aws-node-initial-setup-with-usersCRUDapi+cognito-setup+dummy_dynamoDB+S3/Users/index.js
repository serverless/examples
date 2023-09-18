const {
  createUser,
  updateUser,
  deactivateUser,
  deleteUser,
  getUser
} = require("./users");

const {
  badRequestResponse
} = require("../Utils/responseCodes").responseMessages;

exports.main = async event => {
  console.log("Input to the lambda", event);

  const { action } = event;
  delete event.action;

  if (action === "create") {
    const { userDetails } = event;
    event = {
      ...event,
      ...userDetails
    };
    delete event.userDetails;

    return createUser(event);
  }

  if (action === "update") {
    const { updatedAttributes } = event;

    event = {
      ...event,
      ...updatedAttributes
    };

    delete event.updatedAttributes;

    return updateUser(event);
  }

  if (action === "get") return getUser(event);

  if (action === "delete") return deleteUser(event);

  if (action === "deactivate") return deactivateUser(event);

  return badRequestResponse("unable to match the action", action);
};
