import React, { Fragment, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useActivityDetector, socket } from 'utils';

export default function IdleDetector({ children = null }) {
  const user = useSelector((store) => store.user);
  const { _id: userId, loggedIn: isLoggedIn } = user;
  const isLoggedInRef = useRef(isLoggedIn);
  const userIdRef = useRef(user);

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const handleInactivity = () => {
    if (isLoggedInRef.current) socket.emit('USER_INACTIVE', userIdRef.current);
  };

  const handleActivity = () => {
    if (isLoggedInRef.current) socket.emit('USER_ACTIVE', userIdRef.current);
  };

  // The activity detector hook listens for mouse clicks, keystrokes, or scolling events. If none of those happens
  // within 30 minutes, the user will be logged out.

  useActivityDetector(handleInactivity, handleActivity, 1800000);

  return <Fragment>{children}</Fragment>;
}

IdleDetector.propTypes = {
  children: PropTypes.node,
};
