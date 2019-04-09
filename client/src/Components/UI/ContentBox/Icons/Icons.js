import React, { Fragment } from "react";
import ggbIcon from "./geogebra.png";
import dsmIcon from "./desmos.png";
import ToolTip from "../../../ToolTip/ToolTip";
import classes from "./icons.css";

const Icons = React.memo(props => {
  let lock;
  if (props.lock && props.listType === "public") {
    lock = (
      <ToolTip text="private" delay={600}>
        <i className={["fas fa-lock", classes.Locked].join(" ")} />
      </ToolTip>
    );
  } else if (props.lock && props.listType === "private") {
    lock = (
      <ToolTip text="private" delay={600}>
        <i className={["fas fa-unlock-alt", classes.Unlocked].join(" ")} />
      </ToolTip>
    );
  } else {
    lock = (
      <ToolTip text="public" delay={600}>
        <i className={["fas fa-globe-americas", classes.Globe].join(" ")} />
      </ToolTip>
    );
  }

  let roomType;
  if (props.roomType === "desmos") {
    roomType = <img width={25} src={dsmIcon} alt="dsm" />;
  } else if (props.roomType === "geogebra") {
    roomType = <img width={25} src={ggbIcon} alt="ggb" />;
  }
  return (
    <Fragment>
      <div className={classes.Icon}>
        <img src={props.image} width={25} alt={""} />
      </div>
      <div className={classes.Icon}>{lock}</div>
      <ToolTip text={props.roomType} delay={600}>
        <div className={classes.Icon}>{roomType}</div>
      </ToolTip>
    </Fragment>
  );
});

export default Icons;
