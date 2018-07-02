import React from 'react';
// import classes from './textInput.css';
import Aux from '../../HOC/Auxil';
const TextInput = (props) => {
  return (
    <Aux>
      {props.label ? <label htmlFor={props.name}>{props.label}</label> : null}
      <input
        className={props.class}
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
