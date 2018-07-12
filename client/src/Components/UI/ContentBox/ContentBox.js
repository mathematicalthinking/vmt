import React from 'react';
import classes from './contentBox.css'
const contentBox = props => {
let alignClass= classes.Center;
if (props.align === 'left') alignClass = classes.Left;
if (props.align === 'right') alignClass = classes.Right
return (
  <div className={classes.Container}>
    <div className={classes.Title}>{props.title}</div>
    <div className={[classes.Content, alignClass].join(' ')}>
      {props.children}
    </div>
  </div>
)
}

export default contentBox;
