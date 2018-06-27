import React from 'react';
import classes from './textInput.css';
import Aux from '../../HOC/Auxil';
const TextInput = (props) => {
  return (
    <Aux>
      {props.label ? <label for={props.name}>{props.label}</label> : null}
      <input
        className={classes.Input}
        type={props.type}
        id={props.name}
        name={props.name}
        placeholder={props.placeholder}
        onChange={props.change}
      />
    </Aux>
  )
}

export default TextInput
