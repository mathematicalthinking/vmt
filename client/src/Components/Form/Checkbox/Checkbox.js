import React from 'react';
import classes from './checkbox.css';
const checkbox = props => {
  return (
    <div className={classes.checkbox}>
      <input type="checkbox" id={props.children} onChange={props.change} checked={props.checked}/>
      <label htmlFor={props.children}>{props.children}</label>
    </div>
  )
}

export default checkbox
