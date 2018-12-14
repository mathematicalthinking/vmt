const _ = require('lodash');

const getUser = (req) => {
  return _.propertyOf(req)('user');
}

const getResource = (req) => {
  return _.propertyOf(req)('params.resource');
}

const getParamsId = (req) => {
  return _.propertyOf(req)('params.id');
}

const isValidMongoId = (value) => {
  const regex = new RegExp("^[0-9a-fA-F]{24}$");
  return regex.test(value);
};

module.exports.getUser = getUser;
module.exports.getResource = getResource;
module.exports.getParamsId = getParamsId;
module.exports.isValidMongoId = isValidMongoId;