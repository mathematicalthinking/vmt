import React from 'react';
import button from './images/btn_google_signin_dark_normal_web.png';
import { getGoogleUrl } from '../../../utils/appUrls';

const loginButton = () => {
  return (
    <a href={getGoogleUrl()}>
      <img src={button} alt="signin with google" />
    </a>
  );
};

export default loginButton;
