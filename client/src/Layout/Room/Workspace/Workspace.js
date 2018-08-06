import React from 'react';
import classes from './workspace.css';
const workspace = props => (
  <div className={classes.Container}>
    <div className={classes.Graph}>{props.graph}</div>
    <div className={classes.Chat}>{props.chat}</div>
  </div>
);

export default workspace;
