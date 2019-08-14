const axios = require('axios');

const {
  getMtSsoUrl,
  getVmtIssuerId,
  getMtIssuerId,
} = require('../config/app-urls');
const { apiToken } = require('../constants/sso');
const { signJwt } = require('../middleware/utils/request');

const secret = process.env.MT_USER_JWT_SECRET;
const BASE_URL = getMtSsoUrl();

const generateSsoApiToken = (reqUser) => {
  const payload = { iat: Date.now() };

  if (reqUser) {
    payload.ssoId = reqUser.ssoId;
  }
  const options = {
    expiresIn: apiToken.expiresIn,
    issuer: getVmtIssuerId(),
    audience: getMtIssuerId(),
  };

  return signJwt(payload, secret, options);
};

module.exports.post = async (path, body, reqUser) => {
  try {
    // encoded jwt which sso server will use to verify request came from
    // vmt or enc
    const token = await generateSsoApiToken(reqUser);
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const results = await axios.post(`${BASE_URL}${path}`, body, config);

    return results.data;
  } catch (err) {
    throw err;
  }
};

module.exports.get = async (path, params, reqUser) => {
  try {
    // encoded jwt which sso server will use to verify request came from
    // vmt or enc
    const token = await generateSsoApiToken(reqUser);
    const headers = { Authorization: `Bearer ${token}` };

    const config = { params, headers };

    const results = await axios.get(`${BASE_URL}${path}`, config);

    return results.data;
  } catch (err) {
    throw err;
  }
};

// details { username, password }
module.exports.login = (details) => {
  return this.post('/auth/login', details);
};

module.exports.signup = (details) => {
  return this.post('/auth/signup/vmt', details);
};

module.exports.requestNewAccessToken = (refreshToken) => {
  return this.post('/auth/accessToken', { refreshToken });
};

module.exports.confirmEmail = (token) => {
  return this.get(`/auth/confirmEmail/confirm/${token}`);
};

// user must be logged in to request new confirmEmail email
module.exports.resendConfirmEmail = (reqUser) => {
  return this.get('/auth/confirmEmail/resend', {}, reqUser);
};

// details { email } or { username }
module.exports.forgotPassword = (details) => {
  return this.post('/auth/forgot/password', details);
};

module.exports.validateResetPasswordToken = (token) => {
  return this.get(`/auth/reset/password/${token}`);
};

// details { password } where password is new password
// user is not logged in when making the request
module.exports.resetPassword = (details, token) => {
  return this.post(`/auth/reset/password/${token}`, details);
};

// user must be logged in
// user can reset own password
// user can reset other user's password IF authorized
// for vmt is this only admins?
module.exports.resetPasswordById = (details, reqUser) => {
  return this.post('/auth/reset/password/user', details, reqUser);
};
