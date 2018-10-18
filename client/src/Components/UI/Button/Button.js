import React from 'react';
import classes from './button.css';
const button = props => {
  // let styles = [classes.Button]
  let styles = [classes.Button, classes.Primary]
  if (props.theme === 'secondary') {
    styles = [classes.Button, classes.Secondary]
  }
  if (props.active) {
    styles.push(classes.Active);
  }
  styles = styles.join(" ")

  return (
    <button className={styles} style={{margin: props.m}} onClick={props.click} data-testid={props['data-testid']}>{props.children}</button>
  )
}

export default button;
