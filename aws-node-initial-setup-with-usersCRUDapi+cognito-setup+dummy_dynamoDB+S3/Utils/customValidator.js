const { mandatoryFieldsValidation } = require("./validators");

const customValidator = (data, fields) => {
  const errors = [];
  const createModuleMandatoryFields = fields;

  const missingParameters = mandatoryFieldsValidation(
    createModuleMandatoryFields,
    data
  );

  if (missingParameters.length)
    errors.push(
      `Mandatory parameters are missing: ${missingParameters.join(",")}`
    );
  return errors;
};

module.exports = {
  customValidator
};
