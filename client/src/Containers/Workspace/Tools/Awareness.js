import React from "react";
import { Avatar } from "../../../Components";
import classes from "./tools.css";

const iconMap = {
  USER: <Avatar />
};

const Awareness = props => {
  let { awarenessDesc, awarenessIcon } = props;
  console.log(awarenessIcon);
  return (
    <div className={classes.ReferenceControls}>
      <i className="far fa-eye" />
      <div className={classes.AwarenessDesc}>
        <div className={classes.AwarenessIcon}>{iconMap[awarenessIcon]}</div>
        {awarenessDesc}
      </div>
    </div>
  );
};

export default Awareness;
