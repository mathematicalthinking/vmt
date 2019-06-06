const _ = require('lodash');
const models = require('../../models');

const resourceToModelMap = {
  activities: 'Activity',
  courses: 'Course',
  events: 'Event',
  images: 'Image',
  messages: 'Message',
  rooms: 'Room',
  tabs: 'Tab',
  teams: 'Team',
  user: 'User',
  notifications: 'Notification',
};

const getUser = req => {
  return _.propertyOf(req)('mt.auth.vmtUser');
};

const getResource = req => {
  return _.propertyOf(req)('params.resource');
};

const getParamsId = req => {
  return _.propertyOf(req)('params.id');
};

const getModelFromRequest = req => {
  let resource = getResource(req);
  return getModel(resource);
};

const isValidMongoId = value => {
  const regex = new RegExp('^[0-9a-fA-F]{24}$');
  return regex.test(value);
};

const getMethod = req => {
  return _.propertyOf(req)('method');
};

const isModifyRequest = req => {
  let modifyMethods = {
    POST: true,
    PUT: true,
  };

  return modifyMethods[getMethod(req)] === true;
};

const getModel = resource => {
  return models[resourceToModelMap[resource]];
};

const getModelName = resource => {
  return resourceToModelMap[resource];
};

const getSchema = resource => {
  let model = getModel(resource);

  return _.propertyOf(model)('schema');
};

const schemaHasProperty = (schema, property) => {
  if (!_.isString(property)) {
    return false;
  }
  return _.has(schema, `paths.${property}`);
};

module.exports.getUser = getUser;
module.exports.getResource = getResource;
module.exports.getParamsId = getParamsId;
module.exports.isValidMongoId = isValidMongoId;
module.exports.isModifyRequest = isModifyRequest;
module.exports.schemaHasProperty = schemaHasProperty;
module.exports.getSchema = getSchema;
module.exports.getModel = getModel;
module.exports.getModelName = getModelName;
module.exports.getModelFromRequest = getModelFromRequest;
