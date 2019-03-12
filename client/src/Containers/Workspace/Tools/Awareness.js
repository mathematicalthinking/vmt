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
        <img
          className={classes.AwarenessIcon}
          src={icons[30]}
          height={25}
          alt={awarenessIcon}
        />
        {awarenessDesc}
      </div>
    </div>
  );
};

export default Awareness;
