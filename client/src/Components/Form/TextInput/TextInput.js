import React from 'react';
import classes from './textInput.css';
import lightClasses from './lightTextInput.css';
const TextInput = (props) => {
  let styles = props.light ? lightClasses : classes;
  let autoComplete = props.autoComplete || props.type;
  if (props.type === 'password') {autoComplete = 'current-password'}
  return (
    <div className={styles.Container} style={{width: props.width}}>
      <input
        autoComplete={autoComplete}
        className={styles.Input}
        type={props.type}
        id={props.name}
        name={props.name}
        placeholder={props.placeholder}
        onChange={props.change}
        value={props.value}
        style={{fontSize: props.size}}
        data-testid={props['data-testid'] || null}
        />
        {props.label ? <label className={styles.Label} htmlFor={props.name}>{props.label}</label> : null}
    </div>
  )
}

export default TextInput
