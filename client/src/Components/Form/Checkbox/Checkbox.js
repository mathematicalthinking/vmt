/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import classes from './checkbox.css';

const Checkbox = props => {
  const { children, dataId, id, checked, change, style } = props;
  return (
    <div className={classes.checkbox} style={style}>
      <input
        data-testid={`${children}-checkbox`}
        type="checkbox"
        id={id || children}
        userid={dataId}
        onChange={event => {
          change(event, dataId);
        }}
        checked={checked}
      />
      <label htmlFor={id || children}>{children}</label>
    </div>
  );
};

Checkbox.propTypes = {
  children: PropTypes.node.isRequired, // @todo better validator...must be string if id is nulls
  dataId: PropTypes.string.isRequired,
  id: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  change: PropTypes.func.isRequired,
  style: PropTypes.shape({}),
};

Checkbox.defaultProps = {
  id: null,
  style: null,
};
export default Checkbox;
