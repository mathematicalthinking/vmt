import React from 'react';
import classes from './radioBtn.css';
const radioBtn = props => {
  return (
    <label className={classes.Container}>
      {props.children}
      <input data-testid={props['data-testid']} type='radio' checked={props.checked} name={props.name} onChange={props.check}/>
      <span className={classes.Checkmark}></span>
    </label>
  )
}

export default radioBtn;
