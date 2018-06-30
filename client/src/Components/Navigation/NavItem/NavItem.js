import React from 'react';
// import classes from './navItem.css';
import { Link } from 'react-router-dom';
const navItem = (props) => {
  return (
    <li><Link to={props.link}>{props.name}</Link></li>
  )
}

export default navItem;
