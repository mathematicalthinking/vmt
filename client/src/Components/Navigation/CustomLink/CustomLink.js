import React from 'react';
import { Link } from 'react-router-dom';
import classes from './customLink.css';
const CustomLink = (props) => {
  return (
    <Link to={props.to} className={classes.Link}>{props.children}</Link>
  )
}

export default CustomLink;