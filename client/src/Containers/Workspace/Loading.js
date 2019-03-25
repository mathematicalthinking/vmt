import React from "react";
import classes from "./loading.css";
import sine from "./sine.gif";
const Loading = () => {
  return (
    <div className={classes.Loading}>
      <div className={classes.Graph}>
        <img src={sine} height={20} width={150} alt="...loading" />
      </div>
      <div className={classes.Message}>Preparing your room...</div>
    </div>
  );
};

export default Loading;
