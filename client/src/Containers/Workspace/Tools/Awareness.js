import React from "react";
import classes from "./tools.css";
const Awarness = props => {
  let { awarenessDesc, awarenessIcon } = props;
  return (
    <div className={classes.ReferenceControls}>
      <i className="far fa-eye" />
      <div className={classes.AwarenessDesc}>{awarenessDesc}</div>
    </div>
  );
};
