import React from 'react';
import classes from './user.css'
const user = props => {
  return (
    <div className={classes.User}>
      <h2>User Component</h2>
      <div><b>Username: </b>{props.name}</div>
      <div><b>Age: </b>{props.age}</div>
    </div>
  )
}

export default user;
