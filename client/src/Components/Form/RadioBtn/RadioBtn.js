/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import classes from './radioBtn.css';

const RadioBtn = (props) => {
  const { children, checked, name, check } = props;
  return (
    <label className={classes.Container}>
      {children}
      <input
        // eslint-disable-next-line react/destructuring-assignment
        data-testid={props['data-testid']}
        type="radio"
        checked={checked}
        name={name}
        onChange={check}
      />
      <span className={classes.Checkmark} />
    </label>
  );
};

RadioBtn.propTypes = {
  children: PropTypes.node.isRequired,
  checked: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  check: PropTypes.func.isRequired,
  'data-testid': PropTypes.string,
};

RadioBtn.defaultProps = {
  'data-testid': 'radioBtn',
};
export default RadioBtn;
