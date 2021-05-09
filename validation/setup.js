const validator = require("validator");
var _ = require("lodash");

module.exports = function validateSetupInput(data) {
  let errors = {};

  if (_.isEmpty(data.name)) {
    errors.name = "name feild can not be empty";
  }

  if (_.isEmpty(data.pincode)) {
    errors.pincode = "pincode feild can not be empty";
  }

  if (_.isEmpty(data.companyName)) {
    errors.companyName = "company name feild can not be empty";
  }

  return {
    errors,
    isValid: _.isEmpty(errors),
  };
};
