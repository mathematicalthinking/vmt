export const getRedirectUrl = () => {
  const env = process.env.NODE_ENV;
  const isStaging = process.env.REACT_APP_STAGING === 'true';

  if (isStaging) {
    return process.env.REACT_APP_SERVER_URL_STAGING;
  }

  if (env === 'production') {
    return process.env.REACT_APP_SERVER_URL_PRODUCTION;
  }

  return process.env.REACT_APP_SERVER_URL_DEV;
};

export const getMtSsoUrl = () => {
  const env = process.env.NODE_ENV;
  const isStaging = process.env.REACT_APP_STAGING === 'true';

  if (isStaging) {
    return process.env.REACT_APP_MT_LOGIN_URL_STAGING;
  }

  if (env === 'production') {
    return process.env.REACT_APP_MT_LOGIN_URL_PRODUCTION;
  }

  if (process.env.REACT_APP_IS_TEST === 'true') {
    return process.env.REACT_APP_MT_LOGIN_URL_TEST;
  }
  return process.env.REACT_APP_MT_LOGIN_URL_DEV;
};

export const getGoogleUrl = () => {
  const base = getMtSsoUrl();
  const redirectUrl = getRedirectUrl();
  const endpoint = 'oauth/google';
  return `${base}/${endpoint}?redirectURL=${redirectUrl}/oauth/return`;
};
