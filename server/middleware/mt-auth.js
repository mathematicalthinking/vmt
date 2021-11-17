const defaults = require('lodash/defaults');
const {
  isValidMongoId,
  verifyJwt,
  clearAccessCookie,
  clearRefreshCookie,
  setSsoCookie,
} = require('./utils/request');
const User = require('../models/User');

let secret;
if (process.env.NODE_ENV === 'test') {
  secret = process.env.MT_USER_JWT_SECRET_TEST;
} else {
  secret = process.env.MT_USER_JWT_SECRET;
}

const { accessCookie, refreshCookie } = require('../constants/sso');

const ssoService = require('../services/sso');
const { getEncIssuerId, getVmtIssuerId } = require('../config/app-urls');
const sockets = require('../socketInit');

const prep = (req, res, next) => {
  defaults(req, { mt: {} });
  defaults(req.mt, { auth: {} });
  return next();
};

const resolveAccessToken = async (token) => {
  try {
    if (typeof token !== 'string') {
      return null;
    }
    const verifiedToken = await verifyJwt(token, secret);
    return verifiedToken;
  } catch (err) {
    // invalid access token
    return null;
  }
};

const getMtUser = async (req, res) => {
  try {
    let verifiedAccessToken = await resolveAccessToken(
      req.cookies[accessCookie.name]
    );

    if (verifiedAccessToken !== null) {
      return verifiedAccessToken;
    }
    // access token verification failed request new access token with refresh token

    const currentRefreshToken = req.cookies[refreshCookie.name];
    if (currentRefreshToken === undefined) {
      return null;
    }

    // request new accessToken with refreshToken
    const { accessToken } = await ssoService.requestNewAccessToken(
      currentRefreshToken
    );

    verifiedAccessToken = await verifyJwt(accessToken, secret);

    // console.log('received new access token vmt: ', verifiedAccessToken);

    setSsoCookie(res, accessToken);
    return verifiedAccessToken;
  } catch (err) {
    console.error(`Error getMtUser: ${err}`);
    // invalid access token
    return null;
  }
};

const prepareMtUser = (req, res, next) => {
  return getMtUser(req, res)
    .then((user) => {
      // user is null or verified payload from jwt token
      // set on request for later user to retrieve vmt user record
      req.mt.auth.user = user;
      next();
    })
    .catch((err) => {
      console.log(`prepareMtUser error: ${err}`);
    });
};

const prepareVmtUser = (req, res, next) => {
  const mtUserDetails = req.mt.auth.user;

  if (mtUserDetails === null) {
    req.mt.auth.vmtUser = null;
    // clear any invalid cookies
    if (req.cookies[accessCookie.name]) {
      clearAccessCookie(res);
    }
    if (req.cookies[refreshCookie.name]) {
      clearRefreshCookie(res);
    }

    return next();
  }
  // store/update ip addresses

  const ip = req.headers['x-forwarded-for'];

  const update = {
    $set: { latestIpAddress: ip },
    $addToSet: { ipAddresses: ip },
  };

  return User.findByIdAndUpdate(mtUserDetails.vmtUserId, update, { new: true })
    .lean()
    .exec()
    .then((user) => {
      if (user && (user.doForceLogout || user.isSuspended)) {
        // clear socketId, clear cookies
        ssoService.revokeRefreshToken(req.cookies[refreshCookie.name], user);

        const { socketId } = user;
        sockets.io
          .in(socketId)
          .fetchSockets()
          .then((socketList) => {
            const socket = socketList[0];
            if (socket) {
              socket.emit('FORCED_LOGOUT');
            }
          });

        clearAccessCookie(res);
        clearRefreshCookie(res);

        User.findByIdAndUpdate(
          user._id,
          {
            doForceLogout: false,
            socketId: null,
          },
          { new: true }
        ).then(() => {
          req.mt.auth.vmtUser = null;
          req.mt.auth.user = null;
          next();
        });
      } else {
        req.mt.auth.vmtUser = user;
        next();
      }
    })
    .catch(next);
};

const getVmtUser = (mtUserDetails) => {
  if (mtUserDetails === null) {
    // token was not verified; no user authenticated
    return null;
  }
  const { vmtUserId } = mtUserDetails;

  if (isValidMongoId(vmtUserId)) {
    return User.findById(vmtUserId)
      .lean()
      .exec();
  }
  return null;
};

const extractBearerToken = (req) => {
  const { authorization } = req.headers;

  if (typeof authorization !== 'string') {
    return null;
  }
  return authorization.split(' ')[1];
};

const resolveEncRoomToken = async (req) => {
  try {
    const bearerToken = extractBearerToken(req);
    const options = {
      subject: 'room',
      issuer: getEncIssuerId(),
      audience: getVmtIssuerId(),
    };
    if (typeof bearerToken !== 'string') {
      return null;
    }
    const verifiedToken = await verifyJwt(bearerToken, secret, options);
    return verifiedToken;
  } catch (err) {
    // invalid access token
    return null;
  }
};

module.exports.getMtUser = getMtUser;
module.exports.prep = prep;
module.exports.getVmtUser = getVmtUser;
module.exports.prepareMtUser = prepareMtUser;
module.exports.prepareVmtUser = prepareVmtUser;
module.exports.extractBearerToken = extractBearerToken;
module.exports.resolveEncRoomToken = resolveEncRoomToken;
