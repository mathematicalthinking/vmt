import React from 'react';
import button from './images/btn_google_signin_dark_normal_web.png';

const loginButton = (props) => {

  return (
      <img
        src={button}
        alt="signin with google"
        onClick={props.click}
      />
  )
}

export default loginButton;
