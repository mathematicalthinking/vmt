// PROPS
  // Title
  // notifications
  // locked

import React from 'react';
import classes from './contentBox.css'
let alignClass= classes.Center;
const contentBox = props => {
  if (props.align === 'left') alignClass = classes.Left;
  if (props.align === 'right') alignClass = classes.Right;
  const notifications = (props.notifications > 0) ? <div className={classes.Notification}>{props.notifications}</div> : null;
  const locked = props.locked ? <div className={classes.Lock}><i class="fas fa-lock"></i></div> : null;
  return (
    <div className={classes.Container} onClick={this.toggleCollapse}>
      {notifications}
      {locked}
      <div className={classes.Title}>{props.title}</div>
      <div className={[classes.Content, alignClass].join(' ')}>
        {props.children}
      </div>
    </div>
  )
}

export default contentBox;
