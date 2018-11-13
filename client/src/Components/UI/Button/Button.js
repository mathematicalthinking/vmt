import React from 'react';
import classes from './button.css';
const button = props => {
  // let styles = [classes.Button]
  let styles = [classes.Button];
  styles.push(classes[props.theme]);
  styles = styles.join(" ")

  return (
    <button 
      className={styles} 
      style={{margin: props.m}} 
      onClick={props.click} 
      type={props.type}
      data-testid={props['data-testid']}
    >
      {props.children}
    </button>
  )
}

export default button;
