const jwt = require('jsonwebtoken');
const { defaults } = require('lodash');
const { isValidMongoId } = require('./utils/request');
const User = require('../models/User');
const { getVmtIssuerId, getMtIssuerId } = require('../config/app-urls');

const secret = process.env.MT_USER_JWT_SECRET;
const { apiToken, accessCookie } = require('../constants/sso');

const prep = (req, res, next) => {
  defaults(req, { mt: {} });
  defaults(req.mt, { auth: {} });
  return next();
};

const getMtUser = async req => {
  try {
    let accessToken = req.cookies[accessCookie.name];

    if (accessToken === undefined) {
      return null;
    }

    // if token is not verified, error will be thrown
    let verifiedToken = await jwt.verify(accessToken, secret);

    return verifiedToken;
  } catch (err) {
    console.error(`Error getMtUser: ${err}`);
    return null;
  }
};

const prepareMtUser = (req, res, next) => {
  return getMtUser(req)
    .then(user => {
      // user is null or verified payload from jwt token
      // set on request for later user to retrieve vmt user record
      req.mt.auth.user = user;
      next();
    })
    .catch(err => {
      console.log(`prepareMtUser error: ${err}`);
    });
};

const prepareVmtUser = (req, res, next) => {
  let mtUserDetails = req.mt.auth.user;

  if (mtUserDetails === null) {
    req.mt.auth.vmtUser = null;
    return next();
  }

  return User.findById(mtUserDetails.vmtUserId)
    .lean()
    .exec()
    .then(user => {
      req.mt.auth.vmtUser = user;
      next();
    });
};

const getVmtUser = mtUserDetails => {
  if (mtUserDetails === null) {
    // token was not verified; no user authenticated
    return null;
  }
  let { vmtUserId } = mtUserDetails;

  if (isValidMongoId(vmtUserId)) {
    return User.findById(vmtUserId)
      .lean()
      .exec();
  }
  return null;
};

const extractBearerToken = req => {
  let { authorization } = req.headers;

  if (typeof authorization !== 'string') {
    return;
  }
  return authorization.split(' ')[1];
};

// used when communicating to MT SSO
const generateAnonApiToken = (expiration = apiToken.expiresIn) => {
  let payload = { iat: Date.now() };
  let options = { expiresIn: expiration, issuer: getVmtIssuerId(), audience: getMtIssuerId() };

  return jwt.sign(payload, secret, options);
};

module.exports.getMtUser = getMtUser;
module.exports.prep = prep;
module.exports.getVmtUser = getVmtUser;
module.exports.prepareMtUser = prepareMtUser;
module.exports.prepareVmtUser = prepareVmtUser;
module.exports.extractBearerToken = extractBearerToken;
module.exports.generateAnonApiToken = generateAnonApiToken;
