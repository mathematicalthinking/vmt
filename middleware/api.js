const utils = require('./utils');
const controllers = require('../controllers');
const _ = require('lodash');
const errors = require('../middleware/errors');
const models = require('../models');

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

const canModifyResource = (req, res, next) => {
  let { id, resource } = req.params;
  let user = utils.getUser(req);

  console.log(`${user.username} is requesting to update  ${resource} (${id}) with request body: ${req.body}`);

  let modelName = utils.getModelName(resource);
  if (modelName === 'User') {
    // users need to be able to request access to another user's room
    return next();
  }

  let model = models[modelName];

  let schema = utils.getSchema(resource);

  if (utils.schemaHasProperty(schema, 'entryCode')) {
    // currently users need to be able to make a put request to any room or course for the entry code
    return next()
  }

  return model.findById(id).populate('members.user', 'members.role').lean().exec()
    .then((record) => {
        if (_.isNil(record)) {
          // record requesting to be modified does not exist
          return errors.sendError.NotFoundError(null, res);
        }
        // if user created record, return next()
        if (_.isEqual(user._id, record.creator)) {
          return next();
        }

        if (_.isArray(record.members)) {
          let userMemberObj = _.find(record.members, (obj) => {
          return _.isEqual(obj.user, user._id);
          });

          if (_.propertyOf(userMemberObj)('role') === 'facilitator') {
            return next();
          }
        }

        // otherwise return not authorized error
        return errors.sendError.NotAuthorizedError('You do not have permission to modify this resource', res);
    })
    .catch(err => {
      console.error(`Error canModifyResource: ${err}`);
      return errors.sendError.InternalError(null, res)
  });
};

module.exports.validateResource = validateResource;
module.exports.validateId = validateId;
module.exports.validateUser = validateUser;
module.exports.canModifyResource = canModifyResource;