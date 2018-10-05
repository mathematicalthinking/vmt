import React from 'react';
import classes from './button.css';
const button = props => {
  let styles = [classes.Button, classes.Primary].join(' ')
  if (props.theme === 'secondary') {
    styles = [classes.Button, classes.Secondary].join(' ')
  }
  return (
    <button className={styles} onClick={props.click}>{props.children}</button>
  )
}

export default button;
