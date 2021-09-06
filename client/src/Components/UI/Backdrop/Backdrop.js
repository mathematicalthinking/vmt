import React from 'react';
import PropTypes from 'prop-types';
import classes from './Backdrop.css';

const Backdrop = ({ show, clicked }) =>
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

Backdrop.defaultProps = {
  clicked: null,
};
export default Backdrop;
