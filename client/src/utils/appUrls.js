export const getRedirectUrl = () => {
  return window.env.REACT_APP_SERVER_URL;
};

export const getMtSsoUrl = () => {
  return window.env.REACT_APP_MT_LOGIN_URL;
};

export const getGoogleUrl = () => {
  const base = getMtSsoUrl();
  const redirectUrl = getRedirectUrl();
  const endpoint = 'oauth/google';
  return `${base}/${endpoint}?redirectURL=${redirectUrl}/oauth/return`;
};

export const getDesmosActivityUrl = (code) =>
  `https://teacher.desmos.com/activitybuilder/custom/${code}`;

export const getVideosUrl = () => window.env.REACT_APP_VIDEOS_FOLDER;
