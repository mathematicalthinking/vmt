module.exports.getMtSsoUrl = () => {
  let envName = process.env.NODE_ENV;

  if (envName === 'production') {
    return process.env.MT_SSO_URL_PROD;
  }

  if (envName === 'staging') {
    return process.env.MT_SSO_URL_STAGING;
  }

  if (envName === 'test') {
    return process.env.MT_SSO_URL_TEST;
  }
  return process.env.MT_SSO_URL_DEV;
};

module.exports.getVmtIssuerId = () => {
  let envName = process.env.NODE_ENV;

  if (envName === 'production') {
    return process.env.JWT_ISSUER_ID_PROD;
  }

  if (envName === 'staging') {
    return process.env.JWT_ISSUER_ID_STAGING;
  }

  if (envName === 'test') {
    return process.env.JWT_ISSUER_ID_TEST;
  }

  return process.env.JWT_ISSUER_ID_DEV;
};

module.exports.getMtIssuerId = () => {
  let envName = process.env.NODE_ENV;

  if (envName === 'production') {
    return process.env.MT_SSO_JWT_ISSUER_ID_PROD;
  }

  if (envName === 'staging') {
    return process.env.MT_SSO_JWT_ISSUER_ID_STAGING;
  }

  if (envName === 'test') {
    return process.env.MT_SSO_JWT_ISSUER_ID_TEST;
  }

  return process.env.MT_SSO_JWT_ISSUER_ID_DEV;
};

module.exports.getEncUrl = () => {
  let envName = process.env.NODE_ENV;

  if (envName === 'production') {
    return process.env.ENC_URL_PROD;
  }

  if (envName === 'staging') {
    return process.env.ENC_URL_STAGING;
  }

  if (envName === 'test') {
    return process.env.ENC_URL_TEST;
  }
  return process.env.ENC_URL_DEV;
};