/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import classes from './checkbox.css';

const Checkbox = (props) => {
  const { children, dataId, id, checked, change, style } = props;
  // Previously, the id used to be either the provided id or children. The problem was if we had several checkboxes in the DOM with the same
  // label (i.e., children), then there might be more than one DOM element with the same id, which is bad.
  // Instead, we give each input a distinct id if one isn't given.
  const eltId = id || Math.random().toString();
  return (
    <div
      className={classes.checkbox}
      style={style}
      data-testid={`${dataId}-checkbox`}
    >
      <input
        type="checkbox"
        id={eltId}
        userid={dataId}
        onChange={(event) => {
          change(event, dataId);
        }}
        checked={checked}
      />
      <label htmlFor={eltId}>{children}</label>
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
