import React from 'react';
// import classes from './navItem.css';
import { Link } from 'react-router-dom';
import classes from './navItem.css';
const navItem = (props) => {
  return (
    <li data-testid={`nav-${props.name}`} className={classes.Item}>
      <Link className={classes.Link} to={props.link}>{props.name}</Link>
      {props.ntf ? <i className={["fas fa-exclamation-circle", classes.Ntf].join(' ')}></i> : null}
    </li>
  )
}

export default navItem;
