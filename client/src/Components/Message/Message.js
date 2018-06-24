import React from 'react';
import classes from './message.css';
const message = props => {
  return (
    <div className={classes.Message}>
      <h3>Message Component</h3>
      <div><b>Message: </b>{props.text}</div>
      <div><b>User: </b>{props.user}</div>
    </div>
  )
}

export default message;
