const jwt = require('jsonwebtoken');
const { defaults } = require('lodash');
const { isValidMongoId } = require('./utils/request');
const User = require('../models/User');

const secret = process.env.MT_USER_JWT_SECRET;

const prep = (req, res, next) => {
  defaults(req, { mt: {} });
  defaults(req.mt, { auth: {} });
  return next();
};

const getMtUser = async req => {
  try {
    let mtToken = req.cookies.mtToken;

    if (!mtToken) {
      return null;
    }

    // if token is not verified, error will be thrown
    let verifiedToken = await jwt.verify(mtToken, secret);

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

module.exports.extractBearerToken = req => {
  let { authorization } = req.headers;

  if (typeof authorization !== 'string') {
    return;
  }
  return authorization.split(' ')[1];
};

module.exports.getMtUser = getMtUser;
module.exports.prep = prep;
module.exports.getVmtUser = getVmtUser;
module.exports.prepareMtUser = prepareMtUser;
module.exports.prepareVmtUser = prepareVmtUser;
