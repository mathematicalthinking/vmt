import React from 'react';
import classes from './textInput.css';
import Aux from '../../HOC/Auxil';
const TextInput = (props) => {
  let autoComplete = props.type;
  if (props.type === 'password') {autoComplete = 'current-password'}
  return (
    <Aux>
      {props.label ? <label htmlFor={props.name}>{props.label}</label> : null}
      <input
        autoComplete={autoComplete}
        className={classes.Input}
        type={props.type}
        id={props.name}
        name={props.name}
        placeholder={props.placeholder}
        onChange={props.change}
        value={props.value}
      />
    </Aux>
  )
}

export default TextInput
