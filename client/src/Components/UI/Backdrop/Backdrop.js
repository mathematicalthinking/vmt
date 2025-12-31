import React from 'react';
import PropTypes from 'prop-types';
import classes from './Backdrop.css';

const Backdrop = ({ show, clicked = null }) =>
  show ? (
    <div
      className={classes.Backdrop}
      onClick={clicked}
      onKeyPress={clicked}
      role="button"
      tabIndex="-1"
    />
  ) : null;

Backdrop.propTypes = {
  show: PropTypes.bool.isRequired,
  clicked: PropTypes.func,
};

export default Backdrop;
