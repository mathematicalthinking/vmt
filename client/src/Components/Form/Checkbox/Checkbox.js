/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import classes from './checkbox.css';

const Checkbox = props => {
  const { children, dataId, checked, change } = props;
  return (
    <div className={classes.checkbox}>
      <input
        data-testid={`${children}-checkbox`}
        type="checkbox"
        id={children}
        userid={dataId}
        onChange={event => {
          change(event, dataId);
        }}
        checked={checked}
      />
      <label htmlFor={children}>{children}</label>
    </div>
  );
};

Checkbox.propTypes = {
  children: PropTypes.node.isRequired,
  dataId: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  change: PropTypes.func.isRequired,
};

export default Checkbox;
