import React from 'react';
import classes from './radioBtn.css';
const RadioBtn = props => {
  return (
    <label className={classes.Row}>
      {props.children}
      <input data-testid={props['data-testid']} type='radio' checked={props.checked} name={props.name} onChange={props.check}/>
      <span className={classes.Checkmark}></span>
    </label>
  )
}

export default RadioBtn;
