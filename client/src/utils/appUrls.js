export const getRedirectUrl = () => {
  const env = process.env.NODE_ENV;

  if (env === 'production') {
    return process.env.REACT_APP_SERVER_URL_PRODUCTION;
  }
  if (env === 'staging') {
    return process.env.REACT_APP_SERVER_URL_STAGING;
  }

  return process.env.REACT_APP_SERVER_URL_DEV;
};

export const getMtSsoUrl = () => {
  const env = process.env.NODE_ENV;

  if (env === 'production') {
    return process.env.REACT_APP_MT_LOGIN_URL_PRODUCTION;
  }
  if (env === 'staging') {
    return process.env.REACT_APP_MT_LOGIN_URL_PRODUCTION;
  }
  if (env === 'test') {
    return process.env.REACT_APP_MT_LOGIN_URL_TEST;
  }
  return process.env.REACT_APP_MT_LOGIN_URL_DEV;
};

export const getGoogleUrl = () => {
  const base = getMtSsoUrl();
  const redirectUrl = getRedirectUrl();
  const endpoint = 'oauth/google';
  return `${base}/${endpoint}?redirectURL=${redirectUrl}`;
};
