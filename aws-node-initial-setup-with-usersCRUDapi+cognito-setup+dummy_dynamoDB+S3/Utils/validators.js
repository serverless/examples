const requiredParam = param => {
  const requiredParamError = new Error(
    `Required parameter, "${param}" is missing.`
  );
  console.log(Error.captureStackTrace);
  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(requiredParamError, requiredParam);
  }

  throw requiredParamError;
};

const mandatoryFieldsValidation = (mandatoryFieldsArray, dataObj) =>
  mandatoryFieldsArray.filter(
    field => !Object.keys(dataObj).includes(field) || !dataObj[field]
  );

module.exports = {
  requiredParam,
  mandatoryFieldsValidation
};
