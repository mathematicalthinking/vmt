const utils = require('./utils');
const controllers = require('../controllers');
const _ = require('lodash');
const errors = require('../middleware/errors');

const validateResource = (req, res, next) => {
  const resource = utils.getResource(req);

  if (_.isNil(controllers[resource])) {
    return errors.sendError.InvalidContentError('Invalid Resource', res);
  }
  next();
};

const validateId = (req, res, next) => {
  const id = utils.getParamsId(req);

  if (!utils.isValidMongoId(id)) {
    return errors.sendError.InvalidArgumentError('Invalid Resource Id', res);
  }
  next();
};

const validateUser = (req, res, next) => {
  const user = utils.getUser(req);

  if (_.isNil(user)) {
    return errors.sendError.InvalidCredentialsError(null, res);
  }
  next();
};

module.exports.validateResource = validateResource;
module.exports.validateId = validateId;
module.exports.validateUser = validateUser;