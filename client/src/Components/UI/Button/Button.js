import React from 'react';
import classes from './button.css';
const button = props => {
  return (
    <button className={classes.Button} onClick={props.click}>{props.children}</button>
  )
}

export default button;
