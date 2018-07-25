import React from 'react';
import classes from './avatar.css';
import { Link } from 'react-router-dom';
const avatar = props => (
  <div className={classes.UserInfo}><Link to='/profile'>
    <i className={["fas fa-user", classes.Avatar].join(' ')}></i>
    {props.username}
  </Link></div>
)

export default avatar;
