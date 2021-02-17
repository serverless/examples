const okResponse = (message = "success", data = "") => ({
  status: true,
  statusCode: 200,
  data: data,
  message: message
});

const internalServerError = (error = [], message = "Internal server error") => {
  if (error instanceof Array) error.forEach(e => console.error(message, e));
  else console.error(message, error);

  return {
    status: false,
    statusCode: 500,
    message: message,
    error
  };
};

const resourceNotFound = (message = "Requested resource not found") => ({
  status: false,
  statusCode: 404,
  message: message
});

const createResponse = (
  message = "Requested data created successfully",
  data = ""
) => ({
  status: true,
  statusCode: 201,
  data: data,
  message: message
});

const updateResponse = (message = "Update successful", data = "") => ({
  status: true,
  statusCode: 200,
  data: data,
  message: message
});

const deleteResponse = (message = "Deleted successfully", data = "") => ({
  status: true,
  statusCode: 204,
  data: data,
  message: message
});

const badRequestResponse = (message = "BadRequestResponse", data = "") => ({
  status: false,
  statusCode: 400,
  data: data,
  message: message
});

const forbiddenResponse = (message = "Access denied", data = "") => ({
  status: false,
  statusCode: 403,
  data: data,
  message: message
});

module.exports.responseMessages = {
  internalServerError,
  okResponse,
  resourceNotFound,
  createResponse,
  updateResponse,
  deleteResponse,
  badRequestResponse,
  forbiddenResponse
};
