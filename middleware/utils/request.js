const _ = require('lodash');
const jwt = require('jsonwebtoken');
const models = require('../../models');

const {accessCookie, refreshCookie, } = require('../../constants/sso');

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
 const setSsoCookie = (res, encodedToken)=> {
  let doSetSecure =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

  let options = { httpOnly: true, maxAge: accessCookie.maxAge, secure: doSetSecure };

  if (doSetSecure) {
    options.domain = process.env.SSO_COOKIE_DOMAIN;
  }

  res.cookie(accessCookie.name, encodedToken, options);
};

const setSsoRefreshCookie = (res, encodedToken) => {
  let doSetSecure =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

  let options = { httpOnly: true,secure: doSetSecure };
  if (doSetSecure) {
    options.domain = process.env.SSO_COOKIE_DOMAIN;
  }

  res.cookie(refreshCookie.name, encodedToken, options);

};

const verifyJwt = (
  token,
  key,
  options,
) => {
  return new Promise(
    (resolve, reject) => {
      jwt.verify(
        token,
        key,
        options || {},
        (err, decoded)=> {
          if (err) {
            resolve([err, null]);
          } else {
            resolve([null, decoded]);
          }
        },
      );
    },
  );
};

const clearAccessCookie = (res) => {
  res.cookie(accessCookie.name, '', {httpOnly: true, maxAge: 0});
};

const clearRefreshCookie = (res) => {
  res.cookie(refreshCookie.name, '', {httpOnly: true, maxAge: 0});

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
module.exports.setSsoCookie = setSsoCookie;
module.exports.setSsoRefreshCookie = setSsoRefreshCookie;
module.exports.verifyJwt = verifyJwt;
module.exports.clearAccessCookie = clearAccessCookie;
module.exports.clearRefreshCookie = clearRefreshCookie;
