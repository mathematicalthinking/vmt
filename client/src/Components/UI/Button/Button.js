import React from "react";
import classes from "./button.css";
const button = props => {
  // let styles = [classes.Button]
  let styles = classes[props.theme];
  if (!props.theme) {
    styles = classes.Small;
  }
  if (props.disabled) {
    styles = classes.Disabled;
  }

  return (
    <button
      className={styles}
      style={{ margin: props.m }}
      onClick={props.click}
      type={props.type}
      data-testid={props["data-testid"]}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default button;
