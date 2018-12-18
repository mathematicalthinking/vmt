const utils = require('./utils/request');
const controllers = require('../controllers');
const _ = require('lodash');
const errors = require('../middleware/errors');
const helpers = require('../middleware/utils/helpers');
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

  let results = {
    canModify: false,
    doesRecordExist: true,
    details: {
      isCreator: false,
      isFacilitator: false,
      modelName: null,

    }
  };

  console.log(`${user.username} is requesting to update  ${resource} (${id}) with request body: ${req.body}`);

  let modelName = utils.getModelName(resource);
  results.details.modelName = modelName;

  let model = models[modelName];
  let schema = utils.getSchema(resource);

  return model.findById(id).populate('members.user', 'members.role').lean().exec()
    .then((record) => {
        if (_.isNil(record)) {
          // record requesting to be modified does not exist
          results.doesRecordExist = false;
          return results;
          // return errors.sendError.NotFoundError(null, res);
        }
        // if user created record, return next()
        if (_.isEqual(user._id, record.creator)) {
          results.canModify = true;
          results.details.isCreator = true;
          return results;

        } if (_.isArray(record.members)) {
          let userMemberObj = _.find(record.members, (obj) => {
            return _.isEqual(obj.user, user._id);
          });

          if (_.propertyOf(userMemberObj)('role') === 'facilitator') {
            results.canModify = true;
            results.details.isFacilitator = true;
            return results;
          }
        }

        if (modelName === 'User') {
          // users need to be able to request access to another user's room
          results.canModify = true;
          return results;
        }

        if (utils.schemaHasProperty(schema, 'entryCode')) {
          // currently users need to be able to make a put request to any room or course for the entry code
          results.canModify = true;
          return results;
        }
    })
    .catch(err => {
      console.error(`Error canModifyResource: ${err}`);
      reject(err);
  });
};

const validateNewRecord = (req, res, next) => {
  let {user, body } = req;
  let { resource } = req.params;

  let model = utils.getModel(resource);

  let doc = new model(body);

  if (!_.hasIn(doc, 'validate')) {
    return errors.sendError.InvalidContentError(null, res);
  }

  doc.validate((err) => {
    if (err) {
      console.log('validation err', err);

      return errors.sendError.InvalidContentError(null, res);
    }

    next();

  })
};

const prunePutBody = (user, recordIdToUpdate, body, modelName, details) => {

  if (!helpers.isNonEmptyObject(details)) {
    details = {};
  }
  let { isCreator, isFacilitator } = details;

  let copy = Object.assign({}, body);
  delete copy._id;

  if (modelName === 'User') {
    let isUpdatingSelf = _.isEqual(user._id, recordIdToUpdate);
    if (!isUpdatingSelf) {
      // can only
      return _.pick(copy, 'notificationType', 'resource', 'user');
    }
    delete copy.username;
    delete copy.password;
    return copy;
  }

  if (modelName === 'Room') {
    if (!isCreator && !isFacilitator) {
      // graphImage? tempRoom?
      return _.pick(copy, ['graphImage','checkAccess', 'tempRoom']);
    }
    return copy;
  }

  if (modelName === 'Course') {
    if (!isCreator && !isFacilitator) {
      return _.pick(copy, 'checkAccess');
    }
    return copy;
  }
  return copy;
}

module.exports.validateResource = validateResource;
module.exports.validateId = validateId;
module.exports.validateUser = validateUser;
module.exports.canModifyResource = canModifyResource;
module.exports.validateNewRecord = validateNewRecord;
module.exports.prunePutBody = prunePutBody;