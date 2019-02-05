import React from "react";
import classes from "./checkbox.css";
const checkbox = props => {
  return (
    <div className={classes.checkbox}>
      <input
        data-testid={`${props.children}-checkbox`}
        type="checkbox"
        id={props.children}
        userid={props.dataId}
        onChange={event => {
          props.change(event, props.dataId);
        }}
        checked={props.checked}
      />
      <label htmlFor={props.children}>{props.children}</label>
    </div>
  );
};

export default checkbox;
