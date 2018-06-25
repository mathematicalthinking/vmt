import React from 'react';
import classes from './textInput.css'
const TextInput = (props) => {
  return (
    <input
      className={classes.Input}
      type={props.type}
      id={props.name}
      name={props.name}
      placeholder={props.placeholder}
      onChange={props.change}
    />
  )
}

export default TextInput
