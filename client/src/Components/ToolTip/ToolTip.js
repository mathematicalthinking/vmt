/**
 * ANY PARENT OF THIS COMPONENT MUST HAVE position: relative.
 */

import React from "react";
import classes from "./toolTip.css";
const ToolTip = props => {
  console.log(props);
  return (
    <span
      className={classes.ToolTipText}
      // style={{ visibility: props.visible ? "visible" : "hidden" }}
    >
      {props.children}
    </span>
  );
};

export default ToolTip;
