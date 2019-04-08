const utils = require("./utils/request");
const controllers = require("../controllers");
const _ = require("lodash");
const errors = require("../middleware/errors");
const helpers = require("../middleware/utils/helpers");
const models = require("../models");

const validateResource = (req, res, next) => {
  const resource = utils.getResource(req);
  if (_.isNil(controllers[resource])) {
    return errors.sendError.InvalidContentError("Invalid Resource", res);
  }
  next();
};

const validateId = (req, res, next) => {
  const id = utils.getParamsId(req);
  if (!utils.isValidMongoId(id)) {
    return errors.sendError.InvalidArgumentError("Invalid Resource Id", res);
  }
  next();
};

const validateUser = (req, res, next) => {
  console.log(Object.keys(req.body));
  console.log(req.params);
  let { resource, id } = req.params;
  if (resource === "tabs") {
    console.log("id: ", id);
    models.Tabs.findById(id)
      .populate({ path: "room", select: "tempRoom" })
      // .select("tempRoom")
      .then(res => {
        console.log("TEMP ROOM: ", res);
      })
      .catch(err => console.log(err));
  } else {
    if (req.body.tempRoom) {
      // @todo we need to CHECK this resource is a tempRoom, not take this req's word for it.
      // temp rooms do not require a validated user
      return next();
    }
    const user = utils.getUser(req);
    console.log("user: ", user);
    if (_.isNil(user)) {
      let { authorization } = req.headers;
      if (authorization) {
        models.User.find({ token: authorization })
          .then(user => {
            userId = user._id;
            if (user[req.params.resource].includes(req.params.id)) {
              next();
            } else {
              errors.sendError.NotAuthorizedError(err, null);
            }
          })
          .catch(err => errors.sendError.NotAuthorizedError(err, null));
      } else {
        return errors.sendError.InvalidCredentialsError(null, res);
      }
    }
    next();
  }
};

const canModifyResource = req => {
  let { id, resource, remove } = req.params;
  let user = utils.getUser(req);

  let results = {
    canModify: false,
    doesRecordExist: true,
    details: {
      isCreator: false,
      isFacilitator: false,
      modelName: null
    }
  };

  console.log(
    `${user.username}
    is requesting to update ${resource} (${id}) with request body:
    ${req.body}
    `
  );

  let modelName = utils.getModelName(resource);
  results.details.modelName = modelName;
  let model = models[modelName];
  let schema = utils.getSchema(resource);
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
    .populate("members.user", "members.role")
    .populate("room", "creator members")
    .populate("activity", "creator")
    .lean()
    .exec()
    .then(record => {
      // console.log(model);
      if (_.isNil(record)) {
        // record requesting to be modified does not exist
        results.doesRecordExist = false;
        return results;
      }
      // user can modify if creator
      if (_.isEqual(user._id, record.creator)) {
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
        let roomCreator = record.room.creator;

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
        let activityCreator = record.activity.creator;

        if (_.isEqual(user._id, activityCreator)) {
          results.canModify = true;
          results.details.isCreator = true;
          return results;
        }
      }

      if (modelName === "Notification") {
        if (
          _.isEqual(user._id, record.toUser) ||
          _.isEqual(user._id === record.fromUser)
        ) {
          results.canModify = true;
          return results;
        }
      }

      if (modelName === "Tab") {
        if (_.isArray(record.room.members)) {
          let role = helpers.getUserRoleInRecord(record.room, user._id);
          if (role) results.canModify = true;
        }
      }

      if (modelName === "User") {
        // users need to be able to request access to another user's room
        results.canModify = true;
        return results;
      }

      if (utils.schemaHasProperty(schema, "entryCode")) {
        // currently users need to be able to make a put request to any room or course for the entry code
        results.canModify = true;
        return results;
      }
      // console.log('returning result, ', results)
      return results;
    })
    .catch(err => {
      console.error(`Error canModifyResource: ${err}`);
      reject(err);
    });
};

const validateNewRecord = (req, res, next) => {
  let { user, body } = req;
  let { resource } = req.params;
  let model = utils.getModel(resource);
  let doc = new model(body);
  if (!_.hasIn(doc, "validate")) {
    console.log("INVALID CONTENT ERROR");
    return errors.sendError.InvalidContentError(null, res);
  }

  doc.validate(err => {
    if (err) {
      console.log("validation err", err);

      return errors.sendError.InvalidContentError(null, res);
    }

    next();
  });
};

const prunePutBody = (user, recordIdToUpdate, body, details) => {
  if (!helpers.isNonEmptyObject(details)) {
    details = {};
  }
  let { isCreator, isFacilitator, modelName } = details;
  let copy = Object.assign({}, body);
  if (modelName === "User") {
    let isUpdatingSelf = _.isEqual(user._id, recordIdToUpdate);
    if (!isUpdatingSelf) {
      // can only modify another user's notifications
      return _.pick(
        copy,
        "notificationType",
        "resource",
        "user",
        "_id",
        "courseNotifications.access",
        "roomNotifications.access"
      );
    }
    // username and password uneditable currently
    delete copy.username;
    delete copy.password;
    return copy;
  }

  if (modelName === "Room") {
    if (!isCreator && !isFacilitator) {
      // graphImage? tempRoom?
      if (body.members && body.members.user === user._id.toString()) {
        return _.pick(copy, "members");
      }
      return _.pick(copy, ["graphImage", "checkAccess", "tempRoom"]);
    }
    return copy;
  }

  if (modelName === "Course") {
    if (!isCreator && !isFacilitator) {
      // If the user is trying to remove themself, let them
      if (body.members && body.members.user === user._id.toString()) {
        return _.pick(copy, "members");
      }
      return _.pick(copy, "checkAccess");
    }
    return copy;
  }
  // TODO: determine editable fields for other models
  return copy;
};

module.exports.validateResource = validateResource;
module.exports.validateId = validateId;
module.exports.validateUser = validateUser;
module.exports.canModifyResource = canModifyResource;
module.exports.validateNewRecord = validateNewRecord;
module.exports.prunePutBody = prunePutBody;
