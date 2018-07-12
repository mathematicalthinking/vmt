import React from 'react';
import classes from './contentBox.css'
const contentBox = props => (
  <div className={classes.Container}>
    <div className={classes.Title}>{props.title}</div>
    {props.children}
  </div>
)

export default contentBox;
