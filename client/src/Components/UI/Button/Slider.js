import React from 'react';
import PropTypes from 'prop-types';
import classes from './Slider.css';

const Slider = ({ onClick, isOn }) => {
  const click = () => {
    console.log('clicked toggle');
    onClick();
  };
  return (
    <label className={classes.Switch} htmlFor="referencing">
      <input type="checkbox" checked={isOn} onClick={click} id="referencing" />
      <span className={classes.Slider} />
    </label>
  );
};

Slider.propTypes = {
  onClick: PropTypes.func.isRequired,
  isOn: PropTypes.bool.isRequired,
};

export default Slider;
