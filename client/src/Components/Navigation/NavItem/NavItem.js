import React from 'react';
import classes from './navItem.css';
import { Link } from 'react-router-dom';
const navItem = (props) => {
  return (
    <Link className={classes.NavItem} to={props.link}>{props.name}</Link>
  )
}

export default navItem;
