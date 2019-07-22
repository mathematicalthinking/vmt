import React from 'react';
import PropTypes from 'prop-types';
import classes from './loading.css';
import sine from './sine.gif';

const Loading = ({ message, isSmall }) => {
  return (
    <div className={!isSmall ? classes.Loading : classes.SmallLoading}>
      <div className={classes.Graph}>
        <img src={sine} height={20} width={100} alt="...loading" />
      </div>
      <div className={classes.Message}>{message}</div>
    </div>
  );
};

Loading.propTypes = {
  message: PropTypes.string,
  isSmall: PropTypes.bool,
};

Loading.defaultProps = {
  message: null,
  isSmall: false,
};

export default Loading;
