import React from "react";
import { Avatar } from "../../../Components";
import classes from "./tools.css";
import icons from "./GgbIcons/";

const Awareness = props => {
  let { awarenessDesc, awarenessIcon } = props;
  console.log(awarenessIcon);
  return (
    <div className={classes.ReferenceControls}>
      <i className="far fa-eye" />
      <div className={classes.AwarenessDesc}>
        {awarenessDesc}
        <img
          className={classes.AwarenessIcon}
          src={icons[awarenessIcon]}
          height={40}
          alt={awarenessIcon}
        />
      </div>
    </div>
  );
};

export default Awareness;
