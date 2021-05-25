import React from 'react';
import PropTypes from 'prop-types';
import classes from './Slider.css';

const Slider = ({ action, isOn, 'data-testid': dataTestId, name }) => {
  return (
    <label className={classes.Switch} htmlFor={name}>
      <input
        name={name}
        type="checkbox"
        checked={isOn}
        onChange={action}
        id={name}
        data-testid={dataTestId}
      />
      <span className={classes.Slider} />
    </label>
  );
};

Slider.propTypes = {
  action: PropTypes.func.isRequired,
  isOn: PropTypes.bool.isRequired,
  'data-testid': PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default Slider;
