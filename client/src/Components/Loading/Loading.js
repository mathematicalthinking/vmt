import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classes from './loading.css';
import sine from './sine.gif';

const Loading = ({ message, isSmall, waitTimeMs }) => {
  const [doDisplay, setDisplay] = useState(false);

  const [timer, setTimer] = useState(false);

  useEffect(() => {
    if (!timer) {
      const timeout = setTimeout(() => {
        if (!doDisplay) {
          setDisplay(true);
        }
      }, waitTimeMs);

      setTimer(timeout);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
        setTimer(null);
      }
    };
  });

  return doDisplay ? (
    <div className={!isSmall ? classes.Loading : classes.SmallLoading}>
      <div className={classes.Graph}>
        <img src={sine} height={20} width={100} alt="...loading" />
      </div>
      <div className={classes.Message}>{message}</div>
    </div>
  ) : null;
};

Loading.propTypes = {
  message: PropTypes.string,
  isSmall: PropTypes.bool,
  waitTimeMs: PropTypes.number,
};

Loading.defaultProps = {
  message: null,
  isSmall: false,
  waitTimeMs: 100,
};

export default Loading;
