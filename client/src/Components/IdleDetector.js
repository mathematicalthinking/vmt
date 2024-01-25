import React, { Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { useActivityDetector } from 'utils';

// eslint-disable-next-line react/prop-types
export default function IdleDetector({ children }) {
  // Note that IdleDetector must be inside the Router (see App.js) so that there's a history object
  const history = useHistory();
  const handleInactivity = () => {
    history.push('/logout');
  };

  // The activity detector hook listens for mouse clicks, keystrokes, or scolling events. If none of those happens
  // within 30 minutes, the user will be logged out.
  useActivityDetector(handleInactivity, 1800000); // 30 minutes = 1800000 milliseconds

  return <Fragment>{children} </Fragment>;
}
