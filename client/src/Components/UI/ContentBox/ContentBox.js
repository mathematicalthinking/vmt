import React from 'react';
import classes from './contentBox.css';
import Icons from './Icons/Icons';
import { Link } from 'react-router-dom';
const contentBox = props => {
  let alignClass = classes.Center;
  if (props.align === 'left') alignClass = classes.Left;
  if (props.align === 'right') alignClass = classes.Right;
  const notifications = (props.notifications > 0) ? <div className={classes.Notification} data-testid="content-box-ntf">{props.notifications}</div> : null;

  return (
    <Link to={props.link} data-testid='content-box'>
    <div className={classes.Container} onClick={this.toggleCollapse}>
      <div className={classes.Icons}><Icons image={props.image} lock={props.locked} roomType={props.roomType}/></div>
      {notifications}
      <div className={classes.Title} data-testid="content-box-title">{props.title}</div>
      <div className={[classes.Content, alignClass].join(' ')}>
        {/* // Maybe separate all of this out ot its own component or revert back passing in props.children */}
        {props.details ?
          <div>
            <div>{props.details.description || ''}</div>
            <div>{props.details.teachers.forEach(teacher => teacher) || ''}</div>
            {props.details.entryCode ? <div>Entry Code: {props.details.entryCode}</div> : null}
          </div> : props.children}
      </div>
    </div>
    </Link>
  )
}

export default contentBox;
