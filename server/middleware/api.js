const _ = require('lodash');
const utils = require('./utils/request');
const controllers = require('../controllers');
const errors = require('../middleware/errors');
const helpers = require('../middleware/utils/helpers');
const models = require('../models');

const { getUser } = require('./utils/request');
const { resolveEncRoomToken } = require('../middleware/mt-auth');

const validateResource = (req, res, next) => {
  const resource = utils.getResource(req);
  if (_.isNil(controllers[resource])) {
    return errors.sendError.InvalidContentError('Invalid Resource', res);
  }
  return next();
};

const validateId = (req, res, next) => {
  const id = utils.getParamsId(req);
  if (!utils.isValidMongoId(id)) {
    return errors.sendError.InvalidArgumentError('Invalid Resource Id', res);
  }
  return next();
};

const validateUser = (req, res, next) => {
  delete req.isTempRoom; // see if (tab.room.tempRoom)
  const { resource, id } = req.params;

  if (req.body.tempRoom) {
    // @todo we need to CHECK this resource is a tempRoom, not take this req's word for it.
    // temp rooms do not require a validated user
    return next();
  }
  const user = utils.getUser(req);
  if (user) {
    return next();
  }
  // if there is no user check if the resource is the tab of temp room
  if (resource === 'tabs') {
    return models.Tab.findById(id)
      .populate({ path: 'room', select: 'tempRoom' })
      .then((tab) => {
        if (tab.room.tempRoom) {
          // modify the req so don't have to check this in subsequent middlewate
          req.isTempRoom = true;
        }
        return next();
      })
      .catch(() => {
        errors.sendError.InternalError(null, res);
      });
  }

  return errors.sendError.NotAuthorizedError(null, res);
};

const validateRecordAccess = (req, res, next) => {
  const user = getUser(req);
  const { id, resource } = req.params;
  const modelName = utils.getModelName(resource);
  const model = models[modelName];

  if (!user) {
    // no user logged in; check if tempRoom
    if (req.params.resource === 'rooms') {
      return model
        .findById(id)
        .lean()
        .then((room) => {
          if (!room) {
            return errors.sendError.NotFoundError(null, res);
          }
          if (room.tempRoom) {
            return next();
          }
          return errors.sendError.NotAuthorizedError(null, res);
        })
        .catch((err) => {
          console.error(`Error canModifyResource: ${err}`);
          return errors.sendError.InternalError(null, res);
        });
    }

    return errors.sendError.NotAuthorizedError(null, res);
  }

  if (user.isAdmin) {
    return next();
  }

  const { authorization } = req.headers;

  if (typeof authorization === 'string') {
    // enc room request
    return resolveEncRoomToken(req).then((verifiedToken) => {
      if (verifiedToken !== null) {
        // authorized request from enc server
        return next();
      }
      return errors.sendError.NotAuthorizedError(null, res);
    });
  }

  return (
    model
      .findById(id)
      // .populate('members.user', 'username') // for rooms and courses
      .lean()
      .exec()
      .then((record) => {
        if (record.members) {
          const role = helpers.getUserRoleInRecord(record, user._id);
          if (role) return next();
        }
        if (record.privacySetting === 'public') {
          return next();
        }
        if (_.isEqual(user._id, record.creator)) {
          return next();
        }

        if (
          resource === 'activities' &&
          record.users &&
          Array.isArray(record.users)
        ) {
          const isActivityUser = record.users.includes(user._id);
          const isActivityOwner = record.creator === user._id;
          if (isActivityUser || isActivityOwner) {
            return next();
          }
        }

        return errors.sendError.NotAuthorizedError(null, res);
      })
      .catch((err) => {
        console.error(`Error canModifyResource: ${err}`);
        return errors.sendError.InternalError(null, res);
      })
  );
};

const canModifyResource = (req) => {
  const { id, resource, remove } = req.params;
  // Admins can do anything
  const results = {
    canModify: false,
    doesRecordExist: true,
    details: {
      isCreator: false,
      isFacilitator: false,
      modelName: null,
      isAdmin: false,
    },
  };

  const user = utils.getUser(req);
  if (!user && req.isTempRoom) {
    results.canModify = true;
    return Promise.resolve(results);
  }
  // console.log(
  //   `${user.username}
  //   is requesting to update ${resource} (${id}) with request body:
  //   ${JSON.stringify(req.body, null, 2)}
  //   `
  // );

  // if (user.isAdmin) {
  //   results.canModify = true;
  //   results.details.isAdmin = true;
  //   console.log(`${user.username} is operating as ADMIN`);
  //   return results;
  // }
  const modelName = utils.getModelName(resource);
  results.details.modelName = modelName;
  const model = models[modelName];
  const schema = utils.getSchema(resource);
  // If a user is trying to remove themself they do not have to be facilitator
  if (
    remove &&
    req.body.members &&
    _.isEqual(user._id.toString(), req.body.members.user)
  ) {
    results.canModify = true;
    return Promise.resolve(results); // Promisfy because the middleware caller is expecing a promise
  }
  return model
    .findById(id)
    .populate('members.user', 'members.role')
    .populate('room', 'creator members')
    .populate('activity', 'creator')
    .populate('activity', 'users')
    .lean()
    .exec()
    .then((record) => {
      // allow activity users to modify the activity
      let isInActivityUsers = false;
      if (record.users) {
        record.users.forEach((userId) => {
          if (String(user._id) === String(userId)) {
            isInActivityUsers = true;
          }
        });
      }
      if (user.isAdmin) {
        results.canModify = true;
        return results;
      }
      // console.log(model);
      if (_.isNil(record)) {
        // record requesting to be modified does not exist
        results.doesRecordExist = false;
        return results;
      }
      // user can modify if creator or if in activity.users
      if (_.isEqual(user._id, record.creator) || isInActivityUsers) {
        results.canModify = true;
        results.details.isCreator = true;
        return results;
      }

      if (_.isArray(record.members)) {
        if (helpers.isUserFacilitatorInRecord(record, user._id)) {
          results.canModify = true;
          results.details.isFacilitator = true;
          return results;
        }
      }

      if (helpers.isNonEmptyObject(record.room)) {
        const roomCreator = record.room.creator;

        if (_.isEqual(user._id, roomCreator)) {
          results.canModify = true;
          results.details.isCreator = true;
          return results;
        }

        if (helpers.isUserFacilitatorInRecord(record.room, user._id)) {
          results.canModify = true;
          results.details.isFacilitator = true;
          return results;
        }
      }

      if (helpers.isNonEmptyObject(record.activity)) {
        const activityCreator = record.activity.creator;

        if (_.isEqual(user._id, activityCreator)) {
          results.canModify = true;
          results.details.isCreator = true;
          return results;
        }
      }

      if (modelName === 'Notification') {
        if (
          _.isEqual(user._id, record.toUser) ||
          _.isEqual(user._id === record.fromUser)
        ) {
          results.canModify = true;
          return results;
        }
      }

      if (modelName === 'Tab') {
        if (record.room && _.isArray(record.room.members)) {
          const role = helpers.getUserRoleInRecord(record.room, user._id);
          if (role) results.canModify = true;
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

      if (record.privacySetting === 'public') {
        results.canModify = true;
      }
      // console.log('returning result, ', results)
      return results;
    })
    .catch((err) => {
      console.error(`Error canModifyResource: ${err}`);
    });
};

const validateNewRecord = (req, res, next) => {
  const { body } = req;
  const { resource } = req.params;
  const Model = utils.getModel(resource);
  const doc = new Model(body);
  if (!_.hasIn(doc, 'validate')) {
    return errors.sendError.InvalidContentError(null, res);
  }
  return doc.validate((err) => {
    if (err) {
      console.log('validation err', err);

      return errors.sendError.InvalidContentError(null, res);
    }
    return next();
  });
};

const prunePutBody = (user, recordIdToUpdate, body, details) => {
  if (user && user.isAdmin) return body;
  if (!helpers.isNonEmptyObject(details)) {
    details = {};
  }
  const { isCreator, isFacilitator, modelName } = details;
  const copy = Object.assign({}, body);
  if (modelName === 'User') {
    const isUpdatingSelf = helpers.areObjectIdsEqual(
      user._id,
      recordIdToUpdate
    );
    if (!isUpdatingSelf) {
      // can only modify another user's notifications
      return _.pick(
        copy,
        'notificationType',
        'resource',
        'user',
        '_id',
        'courseNotifications.access',
        'roomNotifications.access'
      );
    }
    // username and password uneditable currently
    delete copy.username;
    delete copy.password;
    return copy;
  }

  if (modelName === 'Room') {
    if (!isCreator && !isFacilitator) {
      // graphImage? tempRoom?
      if (body.members && body.members.user === user._id.toString()) {
        return _.pick(copy, 'members');
      }
      return _.pick(copy, ['graphImage', 'checkAccess', 'tempRoom']);
    }
    return copy;
  }

  if (modelName === 'Course') {
    if (!isCreator && !isFacilitator) {
      // If the user is trying to remove themself, let them
      if (body.members && body.members.user === user._id.toString()) {
        return _.pick(copy, 'members');
      }
      return _.pick(copy, 'checkAccess');
    }
    return copy;
  }
  // TODO: determine editable fields for other models
  return copy;
};

const validateAdmin = (req, res, next) => {
  const user = getUser(req);

  if (!user || !user.isAdmin) {
    return errors.sendError.NotAuthorizedError(null, res);
  }
  return next();
};

module.exports.validateResource = validateResource;
module.exports.validateId = validateId;
module.exports.validateUser = validateUser;
module.exports.canModifyResource = canModifyResource;
module.exports.validateNewRecord = validateNewRecord;
module.exports.prunePutBody = prunePutBody;
module.exports.validateRecordAccess = validateRecordAccess;
module.exports.validateAdmin = validateAdmin;
