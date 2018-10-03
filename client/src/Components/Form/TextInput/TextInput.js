import React from 'react';
import classes from './textInput.css';
const TextInput = (props) => {
  let autoComplete = props.type;
  if (props.type === 'password') {autoComplete = 'current-password'}
  return (
    <div className={classes.Container}>
      {props.label ? <label className={classes.Label} htmlFor={props.name}>{props.label}</label> : null}
      <input
        autoComplete={autoComplete}
        className={classes.Input}
        type={props.type}
        id={props.name}
        name={props.name}
        placeholder={props.placeholder}
        onChange={props.change}
        value={props.value}
        style={{width: props.width}}
      />
    </div>
  )
}

export default TextInput
