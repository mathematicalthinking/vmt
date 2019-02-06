import React from "react";
import classes from "./demoBrowser.css";

const DemoBrowser = ({ size, children }) => {
  return (
    <div className={classes.DemoBrowser}>
      <div className={classes.BrowserMenu}>
        <div className={classes.Circles}>
          <div className={[classes.Circle, classes.Red].join(" ")} />
          <div className={[classes.Circle, classes.Yellow].join(" ")} />
          <div className={[classes.Circle, classes.Green].join(" ")} />
        </div>
        <div className={classes.BroswerContent}>{children}</div>
      </div>
    </div>
  );
};

export default DemoBrowser;
