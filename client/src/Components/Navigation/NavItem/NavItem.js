import React from 'react';
// import classes from './navItem.css';
import { Link } from 'react-router-dom';
import classes from './navItem.css';
const navItem = (props) => {
  return (
    <li data-testid={`nav-${props.name}`} className={classes.Item}><Link className={classes.Link} to={props.link}>{props.name}</Link></li>
  )
}

export default navItem;
