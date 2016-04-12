'use strict';

const V = require('skerla-json-schema');

module.exports = function (constructor) {
  return V(constructor);
};

module.exports.schema = function (schema) {
  const validation = new V.Schema(schema);
  return function (object) {
    const validationResult = validation.validate(object);
    if (!validationResult.isValid()) {
      throw {
        type: 'ValidationError',
        message: 'Invalid request',
        errors: validationResult.getErrors()
      };
    }

    return validationResult.cleanup();
  };
};